/* Router */
let express         = require('express');
let router          = express.Router();
let cors            = require('cors');
let vipController  = require('../controllers').vip;
let utils           = require("../dist/utils");
let User            = require("../models").vip;

router.use(cors());

// router.get(     '/:vip_id',  vipController.one);         // vip 상세
router.get(     '/list',     vipController.list);        // vip 리스트
router.post(    '/',         vipController.insert);      // vip 등록
router.put(     '/:vip_id',  vipController.update);      // vip 업데이트
router.delete(  '/:vip_id',  vipController.delete);      // vip 삭제
router.get(     '/table',    vipController.table);       // vip 삭제

module.exports = router;