/* Router */
let express          = require('express');
let router           = express.Router();
let cors             = require('cors');
let noticeController = require('../controllers').notice;
let utils            = require('../dist/utils');
let notice_upload    = require('../dist/upload').notice_upload;
let Notice           = require('../models').notice;
let path             = require('path');

router.use(cors());

router.get(     '/',            noticeController.call);         // 포럼소식 상세 
router.get(     '/list',        noticeController.call_list);    // 포럼소식 리스트
router.get(     '/table',       noticeController.table);        // 포럼소식 리스트 테이블 출력용
router.get(     '/img/:name',   noticeController.img_view);     // 포럼소식 이미지 라우팅 리스트
router.post(    '/',            notice_upload.array("img"), noticeController.create);  // 포럼소식 등록
router.put(     '/',            notice_upload.array("img"), noticeController.update); // 포럼소식 수정
router.delete(  '/',            noticeController.delete);            // 포럼소식 삭제


module.exports = router;