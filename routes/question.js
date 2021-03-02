/* Router */
let express            = require('express');
let router             = express.Router();
let cors               = require('cors');
let questionController = require('../controllers').question;
let utils              = require('../dist/utils');

router.use(cors());



router.get(   '/:question_id',              questionController.one);        // 피칭 단일 질문 호출
router.get(   '/table/:forum_id',           questionController.table);      // 피칭 전체 질문 호출 테이블 출력용
router.get(   '/com/:pitchings_id/:com_id', questionController.comOne);     // 피칭의 해당 기업 질문 호출
router.get(   '/pitching/:pitchings_id',    questionController.list);       // 피칭의 전체 질문 호출
router.post(  '/:pitchings_id',             questionController.insert);     // 질문 등록
router.put(   '/:question_id',              questionController.update);     // 질문 업데이트
router.delete('/:question_id',              questionController.delete);     // 질문 삭제



module.exports = router;