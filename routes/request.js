/* Router */
let express           = require('express');
let router            = express.Router();
let cors              = require('cors');
let requestController = require('../controllers').request;
let utils             = require('../dist/utils');

router.use(cors());


router.get(     '/:forum_id',       requestController.requestList);     // 신청 리스트 호출
router.post(    '/',                requestController.create);          // 참가신청
router.put(     '/',                requestController.update);          // 참가신청 수정
// router.delete(  '/:request_id',     requestController.delete1);          // 참가신청 완전 삭제
router.delete(  '/:request_id',     requestController.delete2);          // 참가신청 상태 수정
router.get(     '/table/:forum_id', requestController.table);
router.put(     '/on_check',        requestController.onCheck);         // 참여자 온라인 참여
router.put(     '/off_check',       requestController.offCheck);        // 차마여자 오프라인 참여

module.exports = router;
