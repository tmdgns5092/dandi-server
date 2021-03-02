/* Controller */
const Message           = require("../models").message;
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
  //잔여포인트 호출
  getPoint(req, res) {
    var corpNum = '2208211368';

    messageService.getBalance(corpNum,
      function (remainPoint) {
        res.send({point: remainPoint})
      }, function (error) {
          res.send({code: error.code, message: error.message})
      }
    )
  },

  // 퐁인트 충전 팝업
  chargeUrl(req, res) {
    // 팝빌회원 사업자번호, '-' 제외 10자리
    var corpNum = '2208211368';
    // CHRG(포인트충전)
    var userID = 'dandi';

    messageService.getChargeURL(corpNum, userID,
      function (url) {
        res.send({url: url});
      }, function (Error) {
        res.send({code: Error.code, message: Error.message});
      });
  },

  // 발신등록번호 url
  senderNumber(req, res) {
    // 팝빌회원 사업자번호, '-' 제외 10자리
    var testCorpNum = '2208211368';

    // 팝빌회원 아이디
    var testUserID = 'dandi';

    messageService.getSenderNumberMgtURL(testCorpNum, testUserID,
      function (url) {
        res.send({url: url});
      }, function (Error) {
        res.send({code: Error.code, message: Error.message});
      });
  },

  // 발신등록번호 리스트 호출
  senderList(req, res) {
    // 조회할 아이디
    var testCorpNum = '2208211368';

    messageService.getSenderNumberList(testCorpNum,
      function (result) {
        res.send({list: result});
      }, function (Error) {
        res.send({code: Error.code, message: Error.message});
      });
  },
  joinMember(req, res) {
        // 회원정보
    var joinInfo = {
        ID:             'dandi',          // 회원 아이디 (6자 이상 50자 미만)
        PWD:            'dandi123!',      // 회원 비밀번호 (6자 이상 20자 미만)
        LinkID:         'MOB',            // 링크아이디
        CorpNum:        '2208211368',     // 사업자번호, '-' 제외 10자리
        CEOName:        '권영철',         // 대표자명 (최대 100자)
        CorpName:       '사단법인 단디벤처포럼',      // 상호 (최대 200자)
        Addr:           '부산광역시 부산진구 전포대로199번길 43, 3층 22호(전포동, 한일빌딩)',   // 주소 (최대 300자)
        BizType:        '없음',           // 업태 (최대 100자)
        BizClass:       '없음',           // 종목 (최대 100자)
        ContactName:    '권승훈',         // 담당자 성명 (최대 100자)
        ContactEmail:   'tmdgns5092@gmail.com',       // 담당자 이메일 (최대 20자)
        ContactTEL:     '1811-6468',      // 담당자 연락처 (최대 20자)
        // ContactHP: '010-1234-1234' // 담당자 휴대폰번호 (최대 20자)
    };

    messageService.joinMember(joinInfo,
        function (result) {
          console.log(result)
          res.status(200).send({path: req.path, data: result});
        }, function (Error) {
            res.status(200).send({path: req.path, code: Error.code, message: Error.message});
        });
  },

  simpleList(req ,res) {
    console.log(req.query)
    let testCorpNum = '2208211368';
    let testUserID  = 'dandi';
    let reciptNumList = new Array();
    var returnList = new Array, total = 0;

    sequelize.query(`
      SELECT
      	*,
        @ROWNUM := @ROWNUM + 1 AS ROWNUM,
        (SELECT COUNT(*) FROM messages) AS total
      FROM messages,
      (SELECT @ROWNUM := ${req.query.offset}) TMP
      ORDER BY createdAt DESC
      LIMIT ${req.query.offset}, ${req.query.limit};`)
      .then(([sequelizeResult]) => {

        if(sequelizeResult.length < 1)
          return res.status(200).send({total: 0, totalNotFiltered: 0, rows: []})
        else {
          sequelizeResult.forEach(message => {reciptNumList.push(message.reciptNum)});

          messageService.getStates(testCorpNum, reciptNumList, testUserID,
            (results) => {
              // console.log(results);
              results.forEach((result, index)=>{
                let stat = '', createdAt = '';

                if(result.stat == 0) {
                  stat = '접수중';
                  createdAt = '-';
                } else if(result.stat == 1) {
                  stat = '대기중';
                  createdAt = '-';
                } else if(result.stat == 2) {
                  stat = '처리중';
                  createdAt = '-';
                } else if(result.stat == 3) {
                  stat = '완료';
                  createdAt = parse(result.sDT.substr(0, 12));
                } else if(result.stat == 4) {
                  stat = '취소';
                  createdAt = '-';
                } else {
                  stat = '-';
                  createdAt = '-';
                }


                let dbObj = sequelizeResult.find(c => c.reciptNum == result.rNum);
                console.log(dbObj);
                let tmp = {
                  sn :       result.sn,
                  rlt:       rltCheck(result.rlt),
                  stat:      stat,
                  reciptNum: result.rNum,
                  createdAt: createdAt,
                  sendDate:  dbObj.createdAt,
                  ROWNUM:    index + 1,
                }

                let reciptCheck_falg = true;
                returnList.forEach(reciptCheck => {
                  if(tmp.reciptNum == reciptCheck.reciptNum)
                    reciptCheck_falg = false;
                })

                if(reciptCheck_falg) {
                  let count = 0;
                  results.forEach(res=>{
                    if(res.rNum == tmp.reciptNum)
                      count ++;
                  })
                  tmp.count = count + "건";
                  returnList.push(tmp)
                }
              })

              returnList.forEach((retrunObj, index)=> {
                returnList[index].ROWNUM = index + Number(req.query.offset) + 1;
              })

              return res.status(200).send({total: sequelizeResult[0].total, totalNotFiltered: sequelizeResult[0].total, rows: returnList.reverse()});
            },
            (error)  => { console.log(error) })
        }
      })
      .catch(error => {
        console.log(error)
        return res.status(200).send({total: 0, totalNotFiltered: 0, rows: []});
      })
  },

  // 담
  IDs(req, res) {
    var testCorpNum = '2208211368';   // 팝빌회원 사업자번호, '-' 제외 10자리
    var testUserID = 'dandi';         // 팝빌회원 아이디

    // 담당자 정보 항목
    var contactInfo = {
        id: testUserID,                       // 담당자 아이디
        personName: '안진범',                 // 담당자명 (최대 100자)
        tel: '1811-6468',                     // 연락처 (최대 20자)
        hp: '010-9890-4690',                  // 휴대폰번호 (최대 20자)
        email: 'help@eventconnector.net',     // 이메일 (최대 100자)
        searchAllAllowYN: true                // 전체조회여부, 회사조회(true), 개인조회(false)
        // fax: '070-4304-2991',              // 팩스번호 (최대 20자)
    };

    messageService.updateContact(testCorpNum, testUserID, contactInfo,
        function (result) {
            res.send({path: req.path, code: result.code, message: result.message});
        }, function (Error) {
            res.send({path: req.path, code: Error.code, message: Error.message});
        });
  },


  // 장문 전송
  async sendLMS(req, res) {
    // 팝빌회원 사업자번호, '-' 제외 10자리
    var testCorpNum = '2208211368';
    // 발신번호
    var sendNum = req.query.sendNum;
    // 발신자명
    var sendName = '단디벤처포럼';
    // 수신번호
    var receiveNum = req.query.receiveNum;
    // 수신자명
    var receiveName = req.query.receiveName;
    // 메시지 제목
    var subject = '';
    // 메시지 내용, 2000Byte 초과시 길이가 조정되어 전송
    var contents = req.query.contents;
    // 예약전송일시(yyyyMMddHHmmss), 미기재시 즉시전송
    var reserveDT = '';
    // 광고문자 전송여부
    var adsYN = false;

    // 전송요청번호
    // 파트너가 전송 건에 대해 관리번호를 구성하여 관리하는 경우 사용.
    // 1~36자리로 구성. 영문, 숫자, 하이픈(-), 언더바(_)를 조합하여 팝빌 회원별로 중복되지 않도록 할당.
    var requestNum = "";

    messageService.sendLMS(testCorpNum, sendNum, receiveNum, receiveName, subject, contents, reserveDT, adsYN, sendName, requestNum,
        function (receiptNum) {
          Message.create({reciptNum:receiptNum})
            .then(message => res.status(200).send({path: req.path, result: receiptNum}))
            .catch(error => res.status(900).send({path: req.path, result: receiptNum}))
        }, function (Error) {
            res.status(500).send({path: req.path, code: Error.code, message: Error.message});
        });
  },

  // 단문 전송
  sendSMS(req, res){
        // 팝빌회원 사업자번호, '-' 제외 10자리
    var testCorpNum = '2208211368';
    // 발신번호
    var sendNum = req.query.sendNum;
    // 발신자명
    var sendName = '단디벤처포럼';
    // 수신번호
    var receiveNum = req.query.receiveNum;
    // 수신자명
    var receiveName = req.query.receiveName;
    // 메시지 내용, 90Byte 초과시 길이가 조정되어 전송
    var contents = req.query.contents;
    // 예약전송일시(yyyyMMddHHmmss), 미기재시 즉시전송
    var reserveDT = '';
    // 광고문자 전송여부
    var adsYN = false;
    // 전송요청번호
    // 파트너가 전송 건에 대해 관리번호를 구성하여 관리하는 경우 사용.
    // 1~36자리로 구성. 영문, 숫자, 하이픈(-), 언더바(_)를 조합하여 팝빌 회원별로 중복되지 않도록 할당.
    var requestNum = "";

    messageService.sendSMS(testCorpNum, sendNum, receiveNum, receiveName, contents, reserveDT, adsYN, sendName, requestNum,
        function (receiptNum) {
          Message.create({reciptNum:receiptNum})
            .then(message => res.status(200).send({path: req.path, result: receiptNum}))
            .catch(error => res.status(900).send({path: req.path, result: receiptNum}))
        }, function (Error) {
            res.status(500).send({path: req.path, code: Error.code, message: Error.message});
        });
  },

  // router.get('/getMessages', function (req, res, next) {
  getMessage(req, res){
    // 팝빌회원 사업자번호, '-' 제외 10자리
    var testCorpNum = '2208211368';
    // 문자전송 접수번호
    var receiptNum = req.query.reciptNum;

    messageService.getMessages(testCorpNum, receiptNum,
        function (result) {
            res.status(200).send(result)
        }, function (Error) {
          res.status(200).send(Error)
        });
  },

  async authCodeSend(req, res) {
    let Messages = new Array();

    const userSearch = "{{수신자}}"
    const codeSearch = "{{보안코드}}"
    const phoneSearch = "-"
    const userName = new RegExp(userSearch, 'g')
    const authCode = new RegExp(codeSearch, 'g')
    const phoneCheck = new RegExp(phoneSearch, 'g')

    var testCorpNum = '2208211368';
    var sendNum = req.body.sendNum;
    var contents = req.body.content;

    let userList = await selectForumUsers(req.params.forum_id);


    if(!userList || userList.length < 1){
      return res.status(200).send({message: "not found users"});
    } else {
      userList.forEach(user => {
          let sendContent = replaceAll(contents, "{{수신자}}", user.name)
          sendContent     = replaceAll(sendContent, "{{보안코드}}", user.auth_code)
          let phoneNumber = user.phone.replace(phoneCheck, '');
          let message = {};
          if(req.body.method == 'sms') {
            message.Sender        = sendNum
            message.SenderName    = '단디벤처포럼',
            message.Receiver      = phoneNumber
            message.ReceiverName  = user.name
            message.Contents      = sendContent
          }
          else {
            message.Sender        = sendNum
            message.SenderName    = '단디벤처포럼',
            message.Receiver      = phoneNumber
            message.ReceiverName  = user.name
            message.Subject       = ''
            message.Contents      = sendContent
          }
          Messages.push(message);
      })
    }

    if(req.body.method == 'sms') {
      messageService.sendSMS_multi(testCorpNum, sendNum, null, Messages, null, false, '',
        function (receiptNum) {

          Message.create({reciptNum: receiptNum})
            .then(() => res.status(200).send({message: "success"}))
            .catch(error => {
              console.log(error)
              return res.status(200).send({message: error})
            })

        }, function (Error) {
          console.log(Error)
          return res.status(500).send({path: req.path, code: Error.code, message: Error.message});
        });
    }
    else{
      messageService.sendLMS_multi(testCorpNum, sendNum, null, null, Messages, null, false, '',
        function (receiptNum) {
            Message.create({reciptNum: receiptNum})
            .then(() => res.status(200).send({message: "success"}))
            .catch(error => {
              console.log(error)
              return res.status(200).send({message: error})
            })
        }, function (Error) {
          console.log(Error)
          return res.status(500).send({path: req.path, code: Error.code, message: Error.message});
        });
    }
  }
}


function getReciptNum(req) {
  return sequelize.query(`
      SELECT
      	*,
        @ROWNUM := @ROWNUM + 1 AS ROWNUM,
        (SELECT COUNT(*) FROM messages) AS total
      FROM messages,
      (SELECT @ROWNUM := ${req.query.offset}) TMP
      LIMIT ${req.query.offset}, ${req.query.limit};`)
      .then(([result]) => result)
      .catch(error => {
        console.log(error)
        return null
      })
}

function rltCheck(rlt) {
  if(rlt == 100)
    return '문자전송 성공'
  else if(rlt == 200)
    return '메시지 형식 오류'
  else if(rlt == 201)
    return ' 문자길이오류'
  else if(rlt == 202)
    return ' MIME 형식 오류'
  else if(rlt == 203)
    return ' MMS 이미지 처리중 오류'
  else if(rlt == 204)
    return ' MMS 지원되지 않는 미디어 형식'
  else if(rlt == 205)
    return ' MMS 파일 확장자 오류'
  else if(rlt == 206)
    return ' MMS 파일 사이즈 오류'
  else if(rlt == 207)
    return ' MMS 파일 미존재'
  else if(rlt == 208)
    return ' 기타메시지형식오류'
  else if(rlt == 209)
    return ' 컨텐츠 크기 초과'
  else if(rlt == 210)
    return ' 메시지 크기 초과'
  else if(rlt == 211)
    return ' 첨부파일 관련 오류'
  else if(rlt == 300)
    return ' 발신번호 형식 오류'
  else if(rlt == 301)
    return ' 발신번호 사전 미등록'
  else if(rlt == 302)
    return ' 변작신고접수발신번호'
  else if(rlt == 303)
    return ' 발신번호 도용차단 서비스 가입'
  else if(rlt == 401)
    return ' MMS 미지원 단말'
  else if(rlt == 402)
    return ' 메시지 저장개수 초과'
  else if(rlt == 403)
    return ' 단말기 음영지역, 전원꺼짐, 통신사 Time out 404 휴대폰 꺼짐'
  else if(rlt == 405)
    return ' 수신 불량지역에 위치'
  else if(rlt == 406)
    return ' 핸드폰 호 처리중'
  else if(rlt == 407)
    return ' 수신번호 서비스 중지'
  else if(rlt == 408)
    return ' SMS 수신불가 단말'
  else if(rlt == 409)
    return ' 수신자가 발신번호 거부'
  else if(rlt == 410)
    return ' 기타 단말기 오류'
  else if(rlt == 411)
    return ' 착신 가입자 미등록'
  else if(rlt == 415)
    return ' 무응답 및 통화중'
  else if(rlt == 500)
    return ' 이동통신사 스팸 처리'
  else if(rlt == 502)
    return ' 문자 전송시간 초과'
  else if(rlt == 503)
    return ' 공정위(Nospam.go.kr) 등록 스팸번호'
  else if(rlt == 504)
    return ' 기타 이동통신사 오류'
  else if(rlt == 506)
    return ' 이동통신사 착신번호 스팸'
  else if(rlt == 507)
    return ' 수신거부'
  else if(rlt == 510)
    return ' 이동통신사 전화번호 세칙 미준수 발신번호 사용'
  else if(rlt == 511)
    return ' 이동통신사 사전 미등록 발신번호 사용'
  else if(rlt == 512)
    return ' 이동통신사 발신번호 변작으로 등록된 발신번호 사용'
  else if(rlt == 513)
    return ' 이동통신사 번호도용문자차단서비스에 가입된 발신번호 사용'
  else if(rlt == 800)
    return ' 080 수신거부 대상'
  else if(rlt == 801)
    return ' 광고 문자 080 수신거부 번호 미기재'
  else if(rlt == 802)
    return ' 통합 수신거부 대상'
  else if(rlt == 999)
    return ' 기타오류'
}

function selectForumUsers(forum_id) {
  return sequelize.query(`
      SELECT
        user.*,
        request.auth_code
      FROM forums AS forum
      LEFT JOIN (
        SELECT *
          FROM requests
          WHERE auth_code != "" AND
          auth_code IS NOT NULL AND
          requests.show = 1
      ) AS request
      ON request.forums_id = forum.id
      LEFT JOIN users AS user
      ON request.users_id = user.id
      WHERE forum.id = ${forum_id};
    `)
    .then(([result]) => result)
    .catch(error => {
      console.log(error);
      return null;
    })
}
function replaceAll(str, searchStr, replaceStr) {

   return str.split(searchStr).join(replaceStr);
}

function parse(str) {
    var y = str.substr(0, 4);
    var m = str.substr(4, 2);
    var d = str.substr(6, 2);
    var H = str.substr(8, 2);
    var M = str.substr(10, 2);
    return `${y}-${m-1}-${d} ${H}:${M}`;
}
