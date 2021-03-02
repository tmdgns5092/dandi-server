/* Router */
let express          = require('express');
let router           = express.Router();
let cors             = require('cors');
let authController   = require('../controllers').auth;

router.use(cors());

router.get('/',                 authController.check)
router.get('/admin',            authController.admin);
router.post('/list/:forum_id',  authController.authUpdateList);  // 다중 포럼 신청자 보완코드 업데이트
// router.post('/:request_id', authController.authUpdate);      // 단일 포럼 신청자 보완코드 업데이트

router.post('/vip/list',        authController.vipAuthUpdateList);  // 다중 포럼 vip 보완고드 업데이트
router.post('/vip/:vip_id',     authController.vipAuthUpdate);      // 단일 포럼 vip 보완코드 업데이트


module.exports = router;
