/* Controller */
const Member            = require("../models").member_com;
const utils             = require('../dist/utils.js');
const Sequelize         = require("sequelize")
const sequelizeConfig   = require("../config/config.json")
const sequelize         = new Sequelize(sequelizeConfig.development);
const { Op }            = require("sequelize");


module.exports = {

  // 단일 정보 호출
  one(req, res){
    if(!req.query.member_id)
      return res.status(901).send({message: "member_id is required"});

    let where = { id: req.query.member_id };

    Member.findOne({where: where})
      .then(member => {
        if(!member)
          return res.status(200).send({message: `Not Found Member (id = ${req.query.member_id})`})
        else
          return res.status(200).send(member)
      })
      .catch(error => res.status(500).send(error));
  },

  // 다중 정보 호출
  list(req, res){
    let data = {};
    if(req.query.com_name)
      data.name     = {[Op.like]:`%${req.query.com_name}%`}
    if(req.query.name)
      data.name     = {[Op.like]:`%${req.query.name}%`}
    if(req.query.position)
      data.name     = {[Op.like]:`%${req.query.position}%`}
    if(req.query.email)
      data.email    = {[Op.like]:`%${req.query.email}%`}
    if(req.query.phone)
      data.phone    = {[Op.like]:`%${req.query.phone}%`}

    Member.findAll({where: data})
      .then(members => res.status(200).send(members))
      .catch(error => res.status(500).send(error))
  },

  table(req, res) {
    sequelize.query(`
      SELECT
      	*,
      	@ROWNUM := @ROWNUM + 1 AS ROWNUM,
        (SELECT COUNT(*) FROM member_coms) AS total
      FROM member_coms,
      (SELECT @ROWNUM := ${req.query.offset}) TMP
      ORDER BY createdAt DESC
      LIMIT ${req.query.offset}, ${req.query.limit};
    `)
      .then(([result]) =>{
        if(result.length > 0)
          res.status(200).send({total: result[0].total, totalNotFiltered: result[0].total, rows: result})
        else
          res.status(200).send({total: 0, totalNotFiltered: 0, rows: []})
      })
      .catch(error => {
        console.log(error)
        res.status(500).send({message: error})
      });
  },

  // 정보 삽입
  async insert(req, res){
    console.log(req.body);
    if(!req.body.com_name)
      return res.status(901).send({message: "com_name is required"});
    if(!req.body.name)
      return res.status(901).send({message: "name is required"});
    if(!req.body.email)
      return res.status(901).send({message: "email is required"});
    if(!req.body.phone)
      return res.status(901).send({message: "phone is required"});
    if(!req.body.info)
      req.body.info = '';
    if(!req.body.interest)
      req.body.interest = 0;

    let create = {
      com_name: req.body.com_name,
      name:     req.body.name,
      email:    req.body.email,
      phone:    req.body.phone,
      info:     req.body.info,
      interest: req.body.interest,
    }
    let findMember = await findMemberFunction(create);
    console.log("findMember");
    console.log(findMember);

    if(findMember)
      return res.status(200).send({ message: "Already a request"});
    else
      Member.create(create)
        .then(member => res.status(200).send({message : `${create.com_name}-${create.name} create Member Success`, id: member.id}))
        .catch(error => res.status(500).send(error))
  },
  // 정보 갱신
  async update(req, res){
    if(!isNaN(parseInt(req.params.member_id))) {
      if(!req.body.com_name)
        return res.status(901).send({message: "com_name is required"});
      if(!req.body.name)
        return res.status(901).send({message: "name is required"});
      if(!req.body.email)
        return res.status(901).send({message: "email is required"});
      if(!req.body.phone)
        return res.status(901).send({message: "phone is required"});
      if(!req.body.info)
        req.body.info = '';
      if(!req.body.interest)
        req.body.interest = 0;

      let where = { id: req.params.member_id }
      let findMember = await findMemberFunction(where);

      console.log(findMember);

      if(findMember){
        let update = {
          com_name: req.body.com_name,
          name:     req.body.name,
          email:    req.body.email,
          phone:    req.body.phone,
          info:     req.body.info,
          interest: req.body.interest,
        }
        Member.update(update, {where: where})
          .then(() => res.status(200).send({message: 'Member info update Success'}))
          .catch(error => res.status(500).send(error))
      } else
        return res.status(200).send({message: `Not Found Member (id = ${req.params.member_id})`})
    }
    else
      return res.status(900).send({message: "Exception Not number format"});
  },
  // 정보 삭제
  async delete(req, res) {
    if(!isNaN(parseInt(req.params.member_id))) {
      let where = { id: req.params.member_id };
      let findMember = await findMemberFunction(where);

      if(findMember)
        Member.destroy({where: where})
          .then(() => res.status(200).send({message: `${req.params.member_id} destroy success`}))
          .catch(error => res.status(500).send(error))
      else
        return res.status(200).send({message: `Not Found Member (id = ${req.params.member_id})`})
    }
    else
      return res.status(900).send({message: "Exception Not number format"});
  },

  async(req,res){
    return Member
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

function findMemberFunction(where) {
  return Member.findOne({where: where})
    .then(member => member)
    .catch(error => null);
}
