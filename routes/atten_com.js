/* Router */
let express             = require('express');
let router              = express.Router();
let cors                = require('cors');
let attenController     = require('../controllers').atten;
let utils               = require("../dist/utils");
let User                = require("../models").vip;
let ir_upload           = require('../dist/upload').ir_upload;
let introduce_upload    = require('../dist/upload').introduce_upload;

router.use(cors());

router.get(     '/get/:com_id',         attenController.one);       // 참여기업 상세
router.get(     '/ir/:com_id',          attenController.getIr);     // 참여기업 ir자료 가져오기
router.get(     '/introduce/:com_id',   attenController.getIntro);  // 참여기업 ir자료 가져오기
router.get(     '/list',                attenController.list);      // 참여기업 리스트
router.post(    '/',                    attenController.insert);    // 참여기업 등록
router.put(     '/:com_id',             attenController.update);    // 참여기업 업데이트
router.delete(  '/:com_id',             attenController.delete);    // 참여기업 삭제

router.post(    '/ir/:com_id',          ir_upload.array("file"),         attenController.irInsert);         // 참여기업 ir자료 업로드
router.post(    '/introduce/:com_id',   introduce_upload.array("file"),  attenController.introduceInsert);  // 참여기업 소개자료 업로드

router.delete(  '/ir/:ir_id',               attenController.irDelete);          // ir 자료 삭제
router.delete(  '/introduce/:introduce_id', attenController.introduceDelete);   // 소개 자료 삭제

router.get(     '/ir/download/:name',           attenController.irDownload);        // ir자료 다운로드
router.get(     '/introduce/download/:name',    attenController.introduceDownload); // 소개자료 다운로드


module.exports = router;
