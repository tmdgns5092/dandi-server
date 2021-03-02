/* Controller */
const Vip               = require("../models").vip;
const Request           = require("../models").request;
const utils             = require('../dist/utils.js');
const Sequelize         = require("sequelize")
const sequelizeConfig   = require("../config/config.json")
const sequelize         = new Sequelize(sequelizeConfig.development);
const { Op }            = require("sequelize");


module.exports = {
  one(req, res) {
    if(!isNaN(parseInt(req.params.vip_id))) {
      let where = { id: req.params.vip_id }
      Vip.findOne({ where: where})
        .then(vip => {
          if(!vip)
            return res.status(200).send({message: `Not Found Vip (id = ${req.params.vip_id})`})
          else
            return res.status(200).send(vip)
        })
        .catch(error => res.status(500).send(error))
    }
    else
      return res.status(900).send({message: "Exception Not number format"});
  },

  list(req, res) {
    let data = {};
    if(req.query.name)
      data.name     = {[Op.like]:`%${req.query.name}%`}
    if(req.query.email)
      data.email    = {[Op.like]:`%${req.query.email}%`}
    if(req.query.com_name)
      data.com_name    = {[Op.like]:`%${req.query.com_name}%`}
    if(req.query.phone)
      data.phone    = {[Op.like]:`%${req.query.phone}%`}

    Vip.findAll({where: data})
      .then(vips => res.status(200).send(vips))
      .catch(error => res.status(500).send(error))

  },
  async insert(req, res) {
    if(!req.body.name)
      return res.status(901).send({message: "name is required"});
    if(!req.body.email)
      return res.status(901).send({message: "email is required"});
    if(!req.body.com_name)
      return res.status(901).send({message: "com_name file is required"});
    if(!req.body.position)
      return res.status(901).send({message: "position file is required"});
    if(!req.body.phone)
      return res.status(901).send({message: "phone file is required"});
    if(!req.body.auth_code)
      return res.status(901).send({message: "auth_code file is required"});

    let param = {
      name:      req.body.name,
      email:     req.body.email,
      com_name:  req.body.com_name,
      position:  req.body.position,
      phone:     req.body.phone
    }

    let create = {
      name:      req.body.name,
      email:     req.body.email,
      com_name:  req.body.com_name,
      position:  req.body.position,
      phone:     req.body.phone,
      auth_code: req.body.auth_code,
    }

    let flag = await findAllUserAuthCode(req.body.auth_code);
    let signUpCheck = await findUser(param);

    console.log('flag')
    console.log(flag)
    if(flag)
      return res.status(200).send({message: "auth_code is Already"});

    if(!signUpCheck)
      Vip.create(create)
        .then(vip => res.status(200).send({message: "Sign Up Success"}))
        .catch(error => {
          res.status(500).send(error)
        })
    else
      return res.status(200).send({message: `${req.body.name} is Already`});
  },
  async update(req, res) {
    if(!req.body.name)
      return res.status(901).send({message: "name is required"});
    if(!req.body.email)
      return res.status(901).send({message: "email is required"});
    if(!req.body.com_name)
      return res.status(901).send({message: "com_name is required"});
    if(!req.body.position)
      return res.status(901).send({message: "position is required"});
    if(!req.body.phone)
      return res.status(901).send({message: "phone is required"});
    if(!req.body.auth_code)
      return res.status(901).send({message: "auth_code is required"});

    if(!isNaN(parseInt(req.params.vip_id))) {
      let where = { id: req.params.vip_id }
      let findVip = await findUser(where);

      console.log(findVip);

      let flag = await findAllUserAuthCode(req.body.auth_code);
      if(flag)
        return res.status(200).send({message: "auth_code is Already"});

      if(findVip){
        let update = {
          name:         req.body.name,
          email:        req.body.email,
          com_name:     req.body.com_name,
          position:     req.body.position,
          phone:        req.body.phone,
          auth_code:    req.body.auth_code,
          temperature:  req.body.temperature,
        }
        Vip.update(update, {where: where})
          .then(() => res.status(200).send({message: 'vip info update Success'}))
          .catch(error => res.status(500).send(error))
      } else
        return res.status(200).send({message: `Not Found Vip (id = ${req.params.vip_id})`})
    }
    else
      return res.status(900).send({message: "Exception Not number format"});
  },
  async delete(req, res) {
    if(!isNaN(parseInt(req.params.vip_id))) {
      let where = { id: req.params.vip_id };
      let findVip = await findUser(where);

      if(findVip)
        Vip.destroy({where: where})
          .then(() => res.status(200).send({message: `${req.params.vip_id} destroy success`}))
          .catch(error => res.status(500).send(error))
      else
        return res.status(200).send({message: `Not Found Vip (id = ${req.params.vip_id})`})
    }
    else
      return res.status(900).send({message: "Exception Not number format"});
  },

  table(req, res) {
    sequelize.query(`
      SELECT
    		*,
    		@ROWNUM := @ROWNUM + 1 AS ROWNUM,
        (SELECT COUNT(*) FROM vips) AS total
      FROM vips,
      (SELECT @ROWNUM := ${req.query.offset}) TMP
      ORDER BY createdAt DESC
      LIMIT ${req.query.offset}, ${req.query.limit};
    `)
      .then(([result]) => {
        if(result.length < 1)
          return res.status(200).send({total: 0, totalNotFiltered: 0, rows: []})
        else
          return res.status(200).send({total: result[0].total, totalNotFiltered: result[0].total, rows: result})
      })
      .catch(error => {
        console.log(error);
        res.status(500).send(error)
      });
  },

  async(req,res){
    return Vip
      .sync({force:true})
      .then(()=>{
        console.log("user sync success...");
        return res.status(200).send();
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).send();
      });
  }
}

function findUser(where) {
  return Vip.findOne({where: where})
    .then(vip => vip)
    .catch(error => null);
}

function findAllUserAuthCode(auth_code) {
  let flag = false;
  return Request.findAll()
    .then(requests => {
      requests.forEach(request => {
        if(request.auth_code == auth_code)
          flag = true;
      })
      return flag
    })
    .catch(error => null)
}
