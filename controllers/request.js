/* Controller */
const Request           = require("../models").request;
const Message           = require("../models").message;
const Vip               = require("../models").vip;
const User              = require("../models").user;
const Forum             = require("../models").forum;
const utils             = require('../dist/utils.js');
const Sequelize         = require("sequelize")
const sequelizeConfig   = require("../config/config.json")
const sequelize         = new Sequelize(sequelizeConfig.development);
const { Op }            = require("sequelize");
const popbill           = require("popbill");
popbill.config({
    LinkID:          "MOB",
    SecretKey:       "6C/QkhPLqmShhCXARjL3ALF2D2uXFIK4CxdGZ0Yy+p4=",
    IsTest:          false,
    IPRestrictOnOff: true,
    UseStaticIP:     false,
    UseLocalTimeYN:  true,
    defaultErrorHandler: (error) => { console.log('Error Occur : [' + Error.code + '] ' + Error.message); }
})
const messageService    = popbill.MessageService();


module.exports = {
  table(req, res) {
    // Request & Vip
    /*let sql = `SELECT
        @ROWNUM := @ROWNUM + 1 AS ROWNUM,
        "user" AS type,
        user.*,
        request.forums_id,
        request.temperature,
        request.id AS request_id,
        request.on_participation AS request_on,
        request.off_participation AS request_off,
        IFNULL(request.auth_code, '') AS auth_code,
        ((SELECT COUNT(*) FROM requests WHERE forums_id = ${req.params.forum_id}) + (SELECT COUNT(*) FROM vips)) AS total
      FROM requests AS request
      LEFT JOIN users AS user
      ON request.users_id = user.id,
      (SELECT @ROWNUM := ${req.query.offset}) TMP
      WHERE request.show = 1 AND
        request.forums_id = ${req.params.forum_id} AND
        (
          user.name like "%${req.query.search}%"        OR
          user.email like "%${req.query.search}%"       OR
          user.phone like "%${req.query.search}%"       OR
          user.com_name like "%${req.query.search}%" 	  OR
          user.position like "%${req.query.search}%"		OR
          request.auth_code like "%${req.query.search}%"
        )
    union
    SELECT
      @ROWNUM := @ROWNUM + 1 AS ROWNUM,
      "vip" AS type,
      vip.id,
      vip.name,
      vip.email,
      vip.phone,
      vip.com_name,
      vip.position,
      vip.createdAt,
      vip.updatedAt,
      0 AS request_on,
      0 AS request_off,
      11 AS forums_id,
      vip.temperature,
      null AS request_id,
      vip.auth_code AS auth_code,
      ((SELECT COUNT(*) FROM requests WHERE forums_id = ${req.params.forum_id}) + (SELECT COUNT(*) FROM vips)) AS total
    FROM vips AS vip,
    (SELECT @ROWNUM := ${req.query.offset}) TMP
    WHERE
    (
      vip.name like "%${req.query.search}%"        OR
      vip.email like "%${req.query.search}%"       OR
      vip.phone like "%${req.query.search}%"       OR
      vip.com_name like "%${req.query.search}%" 	 OR
      vip.position like "%${req.query.search}%"		 OR
      vip.auth_code like "%${req.query.search}%"
    )
    LIMIT ${req.query.offset}, ${req.query.limit};`;*/
    // Request Only
    let sql = `SELECT
        @ROWNUM := @ROWNUM + 1 AS ROWNUM,
        "user" AS type,
        user.*,
        request.forums_id,
        request.temperature,
        request.id AS request_id,
        request.on_participation AS request_on,
        request.off_participation AS request_off,
        IFNULL(request.auth_code, '') AS auth_code,
        (SELECT COUNT(*) FROM requests WHERE forums_id = ${req.params.forum_id}) AS total
      FROM requests AS request
      LEFT JOIN users AS user
      ON request.users_id = user.id,
      (SELECT @ROWNUM := ${req.query.offset}) TMP
      WHERE request.show = 1 AND
        request.forums_id = ${req.params.forum_id} AND
        (
          user.name like "%${req.query.search}%"        OR
          user.email like "%${req.query.search}%"       OR
          user.phone like "%${req.query.search}%"       OR
          user.com_name like "%${req.query.search}%" 	  OR
          user.position like "%${req.query.search}%"		OR
          request.auth_code like "%${req.query.search}%"
        )
        LIMIT ${req.query.offset}, ${req.query.limit}`;
    console.log(`offset : ${req.query.offset}`);
    sequelize.query(sql)
      .then(([result]) => {
        if(result.length > 0)
          res.status(200).send({total: result[0].total, totalNotFiltered: result[0].total, rows: result})
        else
          res.status(200).send({total: 0, totalNotFiltered: 0, rows: []})
      })
      .catch(error => {
        console.log(error)
        return res.status(500).send(error)
      });
  },
  // 포럼 참가신청
  async create(req, res) {
    if(!req.body.forum_id)
      return res.status(901).send({message: "forum_id is required"});
    if(!req.body.name)
      return res.status(901).send({message: "name is required"});
    if(!req.body.email)
      return res.status(901).send({message: "email is required"});
    if(!req.body.phone)
      return res.status(901).send({message: "phone is required"});
    if(!req.body.com_name)
      return res.status(901).send({message: "com_name is required"});
    if(!req.body.position)
      return res.status(901).send({message: "position is required"});
    if(!req.body.temperature)
      req.body.temperature = 0;


    /* Auth Code Create */
    let auth_code = randomString();
    while(true) {
      let requestAuthCheckList  = await requestAuthCodeFind({auth_code: auth_code, forums_id: req.body.forum_id});
      let vipAuthCheckList      = await vipAuthCodeFind({auth_code: auth_code});

      if(requestAuthCheckList.length > 0 || vipAuthCheckList.length)
        auth_code = randomString();
      else
        break;
    }

    /* User Check */
    let where = {
      name:  req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    };
    let userCheck = await userFind(where);
    let forum     = await forumFind({id: req.body.forum_id});
    let sendNum   = '';
    await senderList()
      .then(data => sendNum = data)
      .catch(error=> {
        console.log(error);
      });


    // 유저 생성 & 참가 신청
    if(!userCheck){
      let create = {
            name:     req.body.name,
            email:    req.body.email,
            phone:    req.body.phone,
            com_name: req.body.com_name,
            position: req.body.position,
          };
      User.create(create)
      .then(user => {
        create = {
          users_id:     user.id,
          forums_id:    req.body.forum_id,
          auth_code:    auth_code,
          temperature:  req.body.temperature,
        }

        // 문자 발송
        let data = requestMessageSend(req.body.phone, req.body.name, req.body.forum_id, auth_code, forum, sendNum);

        Request.create(create)
          .then(request => res.status(200).send({message: `${req.body.name} request success`, id: request.id}))
          .catch(error => res.status(500).send(error))
      })
      .catch(error => res.status(500).send(error));
    }
    // 참가 신청
    else {
      // 신청자 reqest create
      where = {
        users_id: userCheck.id,
        forums_id: req.body.forum_id
      }

      let requestCheck = await requetsAlreadyCheck(where)

      if(!requestCheck){
        let create = {
            users_id:     userCheck.id,
            forums_id:    req.body.forum_id,
            auth_code:    auth_code,
            temperature:  req.body.temperature,
          };

        // 문자 발송
        let data = requestMessageSend(req.body.phone, req.body.name, req.body.forum_id, auth_code, forum, sendNum);
        console.log(data);

        Request.create(create)
          .then(request => res.status(200).send({message: `${req.body.name} request success`, id: request.id}))
          .catch(error => res.status(500).send(error))
      } else {
        // 한 번 삭제된 이력 복구
        if(requestCheck.show == 0){
          let data = requestMessageSend(req.body.phone, req.body.name, req.body.forum_id, auth_code, forum, sendNum);
          console.log(data);
          Request.update({show: 1, temperature: req.body.temperature},{where: {id: requestCheck.id}})
            .then(request => res.status(200).send({message: `${req.body.name} request success`, id: request.id}))
            .catch(error => res.status(500).send(error))

        }
        // 이미 신청한 상태
        else {
          return res.status(200).send({ message: "Already a request"});
        }
      }
    }
  },

  // 포럼의 신청자 리스트 호출
  requestList(req, res) {
    if(!req.params.forum_id)
      return res.status(901).send({message: "forum_id is required"});

    sequelize.query(`
      SELECT
      	request.forums_id,
      	request.auth_code,
        user.id as user_id,
        user.name,
        user.email,
        user.phone,
        user.com_name,
        user.position
      FROM requests AS request
      LEFT JOIN users AS user
      ON request.users_id = user.id
      WHERE request.forums_id = ${req.params.forum_id};
    `)
      .then(([result]) => res.status(200).send(result))
      .catch(error => res.status(500).send({message: error}));
  },

  async update(req, res) {
    let flag  = await vipAllAuthCheck(req.body.auth_code);
    let authCheck = await authCodeCheck(req.body.auth_code, req.body.forum_id, req.body.request_id);

    if(flag)
      return res.status(200).send({message: "auth_code is Already"});

    if(authCheck.length > 0) {
      console.log(`${authCheck.id} 에서 ${authCheck.auth_code}를 이미 사용중입니다.`)
      return res.status(200).send({message: "request auth_code is Already"});
    }


    sequelize.query(`
      SELECT
      	request.auth_code,
        user.*
      FROM requests AS request
      LEFT JOIN users AS user
      ON request.users_id = user.id
      WHERE request.id = ${req.body.request_id};
    `)
      .then(([result]) => {
        result = result[0];
        if(
          result.name      == req.body.user.name &&
          result.email     == req.body.user.email &&
          result.phone     == req.body.user.phone &&
          result.com_name  == req.body.user.com_name &&
          result.position  == req.body.user.position &&
          result.auth_code != req.body.auth_code
          ) {
            // auth code update
            Request.update({auth_code: req.body.auth_code, temperature: req.body.temperature},
                          {where: { id: req.body.request_id }})
              .then(() => res.status(200).send({message: "update success"}))
              .catch(error => {
                console.log(error)
                return res.status(500).send(error)
              })
          }
          else {
            let ne_user_ids = new Array(req.body.ne_user_id);
            // user check
            User.findOne({ where: {
              name:     req.body.user.name,
              email:    req.body.user.email,
              phone:    req.body.user.phone,
              com_name: req.body.user.com_name,
              position: req.body.user.position,
              id: {
                [Op.ne]: {
                  [Op.or]: ne_user_ids
                }
              },
            }})
              .then(user => {
                // reqest user_id update & user create
                if(!user){
                  console.log('reqest user_id update & user create');
                  User.create(req.body.user)
                    .then(newUser => {
                      Request.update({users_id: newUser.id, auth_code: req.body.auth_code, temperature: req.body.temperature },
                                    {where: {id: req.body.request_id}})
                        .then(() => res.status(200).send({message: "user create & update success", user_id: newUser.id}))
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

                // request user_id & auth code update
                else {
                  console.log('request user_id & auth code update')
                  Request.update({users_id: user.id, auth_code: req.body.auth_code, temperature: req.body.temperature },
                                {where: {id: req.body.request_id}})
                    .then(() => res.status(200).send({message: "user update success", user_id: user.id}))
                    .catch(error => {
                      console.log(error)
                      return res.status(500).send(error)
                    })
                }
              })
              .catch(error => {
                console.log(error);
                return res.status(500).send(error)
              })
          }
      });
  },

  delete1(req, res) {
    if(!req.params.request_id)
      return res.status(901).send({message: "request_id is required"});

    Request.destroy({where: {id: req.params.request_id}})
      .then(() => res.status(200).send({message: "delete success"}))
      .catch(error => {
        console.log(error)
        res.status(500).send(error)
      });

  },

  delete2(req, res) {
    if(!req.params.request_id)
      return res.status(901).send({message: "request_id is required"});

    Request.update({show: 0},
        {where: { id: req.params.request_id }})
      .then(() => res.status(200).send({message: "delete success"}))
      .catch(error => {
        console.log(error)
        return res.status(500).send(error)
      })
  },

  onCheck(req, res) {
    if(!req.body.request_id)
      return res.status(901).send({message: "request_id is required"});

    Request.update({on_participation: 1},
                  {where: { id: req.body.request_id }})
      .then(() => res.status(200).send({message: "update success"}))
      .catch(error => {
        console.log(error)
        return res.status(500).send(error)
      })
  },

  offCheck(req, res) {
    if(!req.body.request_id)
      return res.status(901).send({message: "request_id is required"});

    Request.update({off_participation: 1},
                  {where: { id: req.body.request_id }})
      .then(() => res.status(200).send({message: "update success"}))
      .catch(error => {
        console.log(error)
        return res.status(500).send(error)
      })
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

function userFind(where) {
  return User.findOne({where: where})
    .then(user => user)
    .catch(error => null)
}

function forumFind(where) {
  return Forum.findOne({where: where})
    .then(forum => forum)
    .catch(error => {
      console.log(error)
      return null
    })
}

function requetsAlreadyCheck(where) {
  return Request.findOne({where: where})
    .then(request => request)
    .catch(error => null)
}

function vipAllAuthCheck(auth_code) {
  let flag = false;
  return Vip.findAll()
    .then(vips => {
      vips.forEach(vip => {
        if(vip.auth_code == auth_code)
          flag = true;
      })
      return flag
    })
    .catch(error => null)
}

function authCodeCheck(auth_code, forums_id, request_id) {
  return Request.findAll({where: {auth_code: auth_code, forums_id: forums_id, id: {[Op.ne]:request_id}}})
    .then(request => request)
    .catch(error => null)
}

function requestAuthCodeFind(where){
  return Request.findAll({where: where})
    .then(requests => requests)
    .catch(error => null)
}

function vipAuthCodeFind(where) {
  return Vip.findAll({where: where})
    .then(vips => vips)
    .catch(error => null)
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

async function requestMessageSend(receiveNum, receiveName, forum_id, auth_code, forum, sendNum) {
  let date    = new Date(forum.start_date);
  let _month  = date.getMonth() + 1;
  let _date   = date.getDate();
  let _hour   = date.getHours();
  let _minut  = date.getMinutes();
  _month  = (_month>9 ? '' : '0') + _month;
  _date   = (_date >9 ? '' : '0') + _date;
  _hour   = (_hour >9 ? '' : '0') + _hour;
  _minut  = (_minut>9 ? '' : '0') + _minut;


  date.setMinutes(date.getMinutes() - 30);

  var testCorpNum   = '2208211368';         // 팝빌회원 사업자번호, '-' 제외 10자리
  var sendNum       = sendNum;              // 발신번호
  var sendName      = '단디벤처포럼';          // 발신자명
  var receiveNum    = receiveNum;           // 수신번호
  var receiveName   = receiveName;          // 수신자명
  var subject       = '';                   // 메시지 제목
  var contents      = '';                   // 메시지 내용, 2000Byte 초과시 길이가 조정되어 전송
  var reserveDT     = yyyyMMddHHmmss(date); // 예약전송일시(yyyyMMddHHmmss), 미기재시 즉시전송
  var adsYN         = false;                // 광고문자 전송여부
  // 전송요청번호
  // 파트너가 전송 건에 대해 관리번호를 구성하여 관리하는 경우 사용.
  // 1~36자리로 구성. 영문, 숫자, 하이픈(-), 언더바(_)를 조합하여 팝빌 회원별로 중복되지 않도록 할당.
  var requestNum = "";

  contents = `안녕하세요. ${receiveName}님. 단디벤처포럼 사무국입니다.
아래 링크는 ${_month}월 ${_date}일 ${_hour}시 ${_minut}분 부터 개최되는 온라인 단디벤처투자로드쇼 링크입니다.
링크로 접속 후 인증번호를 입력해주세요.
http://dandiventure.com/LiveForum
보안코드: ${auth_code}`;

  // 즉시 문자 발송
  messageService.sendLMS(testCorpNum, sendNum, receiveNum, receiveName, subject, contents, '', adsYN, sendName, requestNum,
      function (receiptNum) {
        Message.create({reciptNum:receiptNum})
          .then(message => {return {code: 200}})
          .catch(error =>  {return {code: 900, message: error}})
      }, function (Error) {
        console.log(Error)
          return {code: 500, message: Error.message};
      });
  // 시작 30분전 예약문자 발송
  messageService.sendLMS(testCorpNum, sendNum, receiveNum, receiveName, subject, contents, reserveDT, adsYN, sendName, requestNum,
      function (receiptNum) {
        Message.create({reciptNum:receiptNum})
          .then(message => { return {code: 200}})
          .catch(error =>  { return {code: 900, message: error}})
      }, function (Error) {
        console.log(Error)
          return {code: 500, message: Error.message};
      });
}

function senderList() {
  return new Promise((resolve, reject) => {
    messageService.getSenderNumberList('2208211368',
      result => {
        result.forEach(obj => {
          if(obj.representYN)
            resolve(obj.number);
        })
      },
      error => {
        reject(error);
      }
    )
  })
}

function yyyyMMddHHmmss(date) {
  var date = new Date(date);

  var mm = date.getMonth() + 1;
  var dd = date.getDate();
  var hh = date.getHours();
  var mm = date.getMinutes();
  var ss = date.getSeconds();

  return [date.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd,
          (hh>9 ? '' : '0') + hh,
          (mm>9 ? '' : '0') + mm,
          (ss>9 ? '' : '0') + ss,
         ].join('');
}
