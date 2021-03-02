/* Router */
let express           = require('express');
let router            = express.Router();
let cors              = require('cors');
let messageController = require('../controllers').message;
let utils             = require('../dist/utils');
let path              = require('path');

router.use(cors());

router.get('/point',        messageController.getPoint);      // 메시지 포인트 호출
router.get('/charge',       messageController.chargeUrl);     // 포인트 충전 url 호출
router.get('/senderNumber', messageController.senderNumber);  // 발신번호 관리 url 호출
router.get('/senderList',   messageController.senderList);    // 발신번호 목록 호출
router.post('/joinMember',  messageController.joinMember);    // 연동회원 가입
router.get('/simpleList',   messageController.simpleList);    // 전송내역 요정정보 리스트 호출
router.put('/IDs',          messageController.IDs);           // 담당자 정보 수정

router.get('/sendLMS',        messageController.sendLMS);
router.get('/sendSMS',        messageController.sendSMS);
router.post('/list/:forum_id', messageController.authCodeSend);
router.get('/getMessages',    messageController.getMessage);

module.exports = router;
