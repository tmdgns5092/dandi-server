/* Router */
let express            = require('express');
let router             = express.Router();
let cors               = require('cors');
let pitchingController = require('../controllers').pitching;
let utils              = require('../dist/utils');

router.use(cors());

router.get(   '/:forums_id', pitchingController.one);       // 포럼의 피칭정보 조회
router.post(  '/:forums_id', pitchingController.insert);    // 포럼의 피칭정보 등록
router.delete('/:forums_id', pitchingController.delete);    // 포럼의 피칭정보 삭제



module.exports = router;