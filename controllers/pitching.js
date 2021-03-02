/* Controller */
const Pitching          = require("../models").pitching;
const utils             = require('../dist/utils.js');
const Sequelize         = require("sequelize")
const sequelizeConfig   = require("../config/config.json")
const sequelize         = new Sequelize(sequelizeConfig.development);
const { Op }            = require("sequelize");


module.exports = {
    // 포럼의 피칭정보 조회
    one(req, res){
      if(!isNaN(parseInt(req.params.forums_id))) {
          let where = { forums_id: req.params.forums_id };
          Pitching.findAll({ where: where })
            .then(pitchings => res.status(200).send(pitchings))
            .catch(error => res.status(500).send(error));
      }
      else 
        return res.status(900).send({message: "Exception Not number format"});
    },
    
    // 포럼의 피칭정보 등록
    insert(req, res) {
      console.log(req.body);
      console.log(req.params);
      if(!isNaN(parseInt(req.params.forums_id))) {
        if(!req.body.yt_link)
          return res.status(901).send({message: "yt_link is required"});
        let where = { forums_id : req.params.forums_id };
        Pitching.findOne({ where: where })
          .then(pitching => {
            if(!pitching)
              Pitching.create({
                forums_id:    req.params.forums_id,
                yt_link:      req.body.yt_link,
              })
                .then(() => res.status(200).send({message: "insert success"}))
                .catch(error => {
                  console.log(error)
                  return res.status(500).send(error)
                })
            else 
              Pitching.update({yt_link: req.body.yt_link}, {where: where})
                .then(() => res.status(200).send({message: "insert success"}))
                .catch(error => {
                  console.log(error)
                  return res.status(500).send(error)
                })
          })
          .catch(error => {
            console.log(error)
            res.status(500).send(error)
          })
      }
      else 
        return res.status(900).send({message: "Exception Not number format"});
    },
    
    // 포럼의 피칭정보 삭제
    async delete(req, res) {
      if(!isNaN(parseInt(req.params.forums_id))) {
          let where = { forums_id: req.params.forums_id };
          let pitching = await findPinching(where);
          
          if(pitching)
            pitching.destroy()
              .then(() => res.status(200).send({message: "delete success"}))
              .catch(error => res.status(500).send(error))
          else
            return res.status(200).send({message: `Not Found Pitching (id = ${req.params.forums_id})`})
      }
      else 
        return res.status(900).send({message: "Exception Not number format"});
    },
    
    async(req,res){
      return Pitching
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

function findPinching(where) {
    return Pitching.findOne({where: where})
      .then(pitching => pitching)
      .catch(error => null)
}