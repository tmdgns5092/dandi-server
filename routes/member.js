/* Router */
let express          = require('express');
let router           = express.Router();
let cors             = require('cors');
let memberController = require('../controllers').member;
let utils            = require("../dist/utils");

router.use(cors());

router.get(     '/',            memberController.one);      // 단일 정보 호출
router.get(     '/list',        memberController.list);     // 다중 정보 호출
router.get(     '/table',       memberController.table);    // 다중 정보 호출 테이블 출력용
router.post(    '/',            memberController.insert);   // 정보 삽입
router.put(     '/:member_id',  memberController.update);   // 정보 갱신
router.delete(  '/:member_id',  memberController.delete);   // 정보 삭제

module.exports = router;