/* Router */
let express          = require('express');
let router           = express.Router();
let cors             = require('cors');
let forumController  = require('../controllers').forum;
let utils            = require('../dist/utils');
let forum_upload     = require('../dist/upload').forum_upload;
let Notice           = require('../models').notice;
let path             = require('path');

router.use(cors());

router.get('/',             forumController.one);
router.get('/test',         forumController.test);
router.get('/img/:name',    forumController.img_view);                              // 포럼소식 이미지 라우팅 리스트
router.post('/',            forum_upload.single("img"), forumController.create);    // 포럼 등록
router.get( '/list',        forumController.list);                                  // 포럼 리스트
router.get( '/table',       forumController.table);                                 // 포럼 리스트 테이블 출력용
router.delete('/:forum_id', forumController.delete);                                // 포럼 삭제


module.exports = router;
