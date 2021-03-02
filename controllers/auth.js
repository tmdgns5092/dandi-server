/* Controller */
const Forum             = require("../models").forum;
const Request           = require("../models").request;
const User              = require("../models").user;
const Vip               = require("../models").vip;
const utils             = require('../dist/utils.js');
const fs                = require('fs');
const uploadFile        = require("../dist/upload");
const Sequelize         = require("sequelize")
const sequelizeConfig   = require("../config/config.json")
const sequelize         = new Sequelize(sequelizeConfig.development);
const { Op }            = require("sequelize");


module.exports = {

  check(req, res) {
    if(!req.query.forum_id)
      return res.status(901).send({message: "forum_id is required"});
    if(!req.query.auth_code)
      return res.status(901).send({message: "auth_code is required"});

    Request.findOne({
        where: { forums_id: req.query.forum_id, auth_code: req.query.auth_code, show: 1 }})
      .then(request => {
        if(request)
          return res.status(200).send({id: request.users_id, request_id: request.id, is_vip: false})
        else {
            Vip.findOne({where: {auth_code: req.query.auth_code}})
              .then(vip => {
                if(vip)
                  return res.status(200).send({id: vip.id, request_id: null, is_vip: true})
                else
                  return res.status(200).send({})
              })
              .catch(error => {
                console.log(error);
                return res.status(500).send(error);
              })
        }
      })
      .catch(error => {
        console.log(error);
        return res.status(500).send(error)
      })
  },

  admin(req, res) {
    console.log("admin~~~")
    try{
      if(req.query.pass == "dandi!"){
        console.log('success')
        return res.status(200).send({message: 'success'})
      }
      else
        return res.status(200).send({message: 'false'})
    } catch(error){
      console.log(error)
      return res.status(200).send({message: 'false'})
    }
  },
  // 다중 포럼 신청자 보완고드 업데이트
  authUpdateList(req, res) {
    let newUserAuthCodeArray = new Array();
    // select) find forum users
    Request.findAll({
        where: {
          forums_id:req.params.forum_id,
          auth_code:{
            [Op.or]: [ {[Op.is]: null}, ""]
          }
        }
      })
      .then(requests => {
        //  user length check
        if(requests.length > 0) {
          // select) vips auth code
          Vip.findAll()
            .then(vips => {
              // request users auth code create
              let vips_auth_code = new Array();
              let code = randomString();
              vips.forEach(vip => { vips_auth_code.push(vip.auth_code); })

              let codeArray = new Array();

              requests.forEach((request, index) => {
                let code = randomString();
                // code input
                while(true) {
                  if(vips_auth_code.indexOf(code) < 0 && codeArray.indexOf(code) < 0){
                    newUserAuthCodeArray.push({
                      id:       request.id,
                      users_id: request.users_id,
                      forums_id: request.forums_id,
                      auth_code: code,
                      createdAt: request.createdAt,
                      updatedAt: request.updatedAt,
                    })
                    codeArray.push(code)
                    break;
                  }
                  code = randomString();
                }
              })

              Request.bulkCreate(newUserAuthCodeArray, { updateOnDuplicate: ['auth_code'] })
                .then(data => res.status(200).send({message: "update success", data: data}))
                .catch(error => {
                  console.log(error)
                  return res.status(500).send(error)
                })
            })
            .catch(error => {
              console.log(error)
              return res.status(500).send(error)
            })
        }
        else
          return res.status(200).send({message: "not found users"});
      })
      .catch(error => {
        // console.log(error)
        return res.status(500).send(error)
      })
    // update
  },

  // 단일 포럼 신청자 보완코드 업데이트
  authUpdate(req, res) {
    if(!isNaN(parseInt(req.params.vip_id))) {
      if(!req.body.auth_code)
        return res.status(901).send({message: "auth_code is required"});
      let where = { id: req.params.request_id };
      let update = { auth_code: req.body.auth_code };

      Request.update(update, { where: where})
        .then(() => res.status(200).send({message: "auth code update success"}))
        .catch(error => res.status(500).send(error));
    } else
      return res.status(900).send({message: "Exception Not number format"});
  },

  // 다중 포럼 vip 보완고드 업데이트
  vipAuthUpdateList(req, res) {
    try{
      if(!req.body.auth_code_list)
        return res.status(901).send({message: "auth_code_list is required"});
      let auth_code_list = req.body.auth_code_list;
      let success_flag = true, error_msg = "";
      auth_code_list.some(item => {
        let where = { id: item.id };
        let update = { auth_code: item.code};

        let flag = Vip.update(update, {where: where})
          .then(() => {
            console.log('vip auth update success')
            return true
          })
          .catch(error => {
            console.log(error)
            success_flag = false
            error_msg = error
            return false
          });
        if(!flag)
          return true;
      });
      if(success_flag)
        return res.status(200).send({message: "vip auth code update success"});
      else
        return res.status(500).send(error_msg);
    }
    catch(Exception){
      console.log(Exception)
      return res.status(500).send(Exception);
    }
  },

  // 단일 포럼 vip 보완코드 업데이트
  async vipAuthUpdate(req, res) {
    if(!isNaN(parseInt(req.params.vip_id))) {
      let where = { id: req.params.vip_id }
      let update = { auth_code: req.body.auth_code }
      let findVip = await findUser(where)

      if(findVip){
        Vip.update(update, { where: where })
          .then(() => res.status(200).send({message: "auth code update success"}))
          .catch(error => res.status(500).send(error))
      }
      else
        return res.status(200).send({message: `Not Found Vip (id = ${req.params.vip_id})`})
    }
    else
      return res.status(900).send({message: "Exception Not number format"});
  },

  async(req,res){
    return Request
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

function requestAuthUpdate(update, where) {
  return Request.update(update, {where: where})
    .then(() => {
      console.log('auth update success')
      return true
    })
    .catch(error => {
      console.log(error)
      return false
    })
}

function findUser(where) {
  return Vip.findOne({where: where})
    .then(vip => vip)
    .catch(error => null);
}

function randomString() {
    // var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var chars = "0123456789";
    var string_length = 6;
    var randomstring = '';
    for (var i=0; i<string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;
  }
