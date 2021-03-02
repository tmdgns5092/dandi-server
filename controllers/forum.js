/* Controller */
const Forum             = require("../models").forum;
const ForumImg          = require("../models").forum_img;
const Request           = require("../models").request;
const Com               = require("../models").atten_com;
const Pitching          = require("../models").pitching;

const User              = require("../models").user;
const utils             = require('../dist/utils.js');
const fs                = require('fs');
const uploadFile        = require("../dist/upload");
const Sequelize         = require("sequelize")
const sequelizeConfig   = require("../config/config.json")
const sequelize         = new Sequelize(sequelizeConfig.development);
const { Op }            = require("sequelize");


module.exports = {

  // 포럼 조회
  async one(req, res) {
    if(!req.query.id)
      return res.status(901).send({message: "id is required"});
    let where = { forums_id: req.query.id }


    let forum     = await getForum({ id: req.query.id }); // 포럼 정보
    let pitching  = await getPitching(where);             // 실시간 피칭 데이터
    // let coms      = await getComAll(where);               // 참여기업 데이터
    let coms      = await getAllComAndFiles(req.query.id) // 참여기업 데이터
    let img       = await getForumImgAll(where);          // 포럼 이미지 데이터
    let requests  = await getRequestAll(req.query.id)     // 신청자 데이터
    let questions = {};
    if(pitching)
      questions   = await getQuestionComUser(pitching.id);

    return res.status(200).send({
      forum:    forum,
      pitching: pitching,
      coms:     coms,
      img:      img,
      requests: requests,
      questions: questions
    })
  },


  // test
  test(req, res) {
    return Forum.findAll()
      .then(forum => res.status(200).send({message: "success", data: forum}))
      .catch(error => res.status(500).send({ message: error }));
  },

  // 포럼 등록
  create(req, res) {
    if(!req.file)
      return res.status(901).send({message: "img file is required"});
    if(!req.body.start_date)
      return res.status(901).send({message: "start_date is required"});
    if(!req.body.start_time)
      return res.status(901).send({message: "start_time is required"});
    if(!req.body.end_time)
      return res.status(901).send({message: "end_time is required"});
    if(!req.body.end_date)
      return res.status(901).send({message: "end_date is required"});
    if(!req.body.title){
      fileRemove(req.file.path);
      return res.status(901).send({message: "title is required"});
    }

    let create = {
      title:      req.body.title,
      end_date:   `${req.body.end_date} ${req.body.end_time}:00`,
      start_date: `${req.body.start_date} ${req.body.start_time}:00`
    };
    Forum.create(create)
      .then(forum => {
        ForumImg.create({
          org_name:   req.file.originalname,
          name:       req.file.filename,
          path:       req.file.destination,
          forums_id:  forum.id,
        })
          .then(forum_img => {
            res.status(200).send({message: "submit success", id: forum_img.id})
          })
          .catch(error =>{
            fileRemove(req.file.path);
            res.status(500).send({ message: error })
          });
      })
      .catch(error => {
        fileRemove(req.file.path);
        res.status(500).send({ message: error })
      })
  },

  // 포럼 리스트
  list(req, res) {
    sequelize.query(`
      SELECT
      	forum.id,
          forum.title,
          forum.end_date,
          forum.start_date,
          img.org_name,
          img.name
      FROM forums AS forum
      LEFT JOIN forum_imgs AS img
      ON forum.id = img.forums_id
      WHERE forum.status = 1
    `)
      .then(([result]) => res.status(200).send(result))
      .catch(error => res.status(500).send({message: error}));
  },
  table(req, res) {
    console.log(req.query)
    sequelize.query(`
      SELECT
      	forum.id,
        forum.title,
        forum.start_date,
        forum.end_date,
        forum.createdAt,
        img.org_name,
        img.name,
        @ROWNUM := @ROWNUM + 1 AS ROWNUM,
        (SELECT COUNT(*) FROM forums WHERE status = 1) AS total
      FROM forums AS forum
      LEFT JOIN forum_imgs AS img
      ON forum.id = img.forums_id,
      (SELECT @ROWNUM := ${req.query.offset}) TMP
      WHERE forum.status = 1
      ORDER BY createdAt DESC
      LIMIT ${req.query.offset}, ${req.query.limit};
    `)
      .then(([result]) => {
        if(result.length > 0)
          res.status(200).send({total: result[0].total, totalNotFiltered: result[0].total, rows: result})
        else
          res.status(200).send({total: 0, totalNotFiltered: 0, rows: []})
      })
      .catch(error => res.status(500).send({message: error}));
  },

  async delete(req, res) {
    if(!isNaN(parseInt(req.params.forum_id))) {
      let where = { forums_id: req.params.forum_id };

      try{
        // let imgs_tmp =  await getForumImgAll(where);

        // // upload img remove
        // imgs_tmp.forEach(img => {
        //   fs.unlink(`${img.path}${img.name}`, function(err){
        //     if(err)
        //       console.log(err);
        //     console.log(`${img.name} deleted`);
        //   });
        // });

        Forum.update({status: 0}, {where: {id: req.params.forum_id}})
          .then(() => res.status(200).send({message: "delete success"}))
          .catch(error => res.status(500).send(error));
      }
      catch(error) {
        return res.status(500).send(error);
      }
    }
    else
      return res.status(900).send({message: "Exception Not number format"});
  },

  img_view(req, res) {
    console.log(req.params.name);
    if(!req.params.name)
      res.status(901).send({message: "name is required"})
    fs.readFile(`/var/www/server/upload/forum/${req.params.name}`, (error, data) => {
      if(error)
        return res.status(500).send({message: error});
      res.send(data);
    })
  },

  async(req,res){
    return Forum
      .sync({force:true})
      .then(()=>{
        console.log("user sync success...");
        return res.status(200).send();
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).send();
      });
  }
}

function fileRemove(path) {
  fs.unlink(path, function(err){
    if(err)
      console.log(err);
    console.log(`${path} deleted`);
  });
}

function getForum(where) {
  return Forum.findOne(
      {where: where},
      {attributes: [
          'id',
          [sequelize.fn('date_format', sequelize.col('end_date'), '%Y-%m-%d'), 'end_date'],
          'title',
      ]})
    .then(forum => forum)
    .catch(error => null)
}
function getForumImgAll(where) {
  return ForumImg.findOne({where: where})
    .then(img => img)
    .catch(error => null)
}
function getRequestAll(id) {
  return sequelize.query(`
    SELECT
      user.*,
      request.forums_id,
      request.id AS request_id,
      IFNULL(request.auth_code, '') AS auth_code
    FROM requests AS request
    LEFT JOIN users AS user
    ON request.users_id = user.id
    WHERE request.forums_id = ${id};
  `)
    .then(([result]) => result)
    .catch(error => null)
}
function getComAll(where) {
  return Com.findAll({where: where})
    .then(com => com)
    .catch(error => null)
}
function getPitching(where) {
  return Pitching.findOne({where: where})
    .then(pitching => pitching)
    .catch(error => null)
}
function getAllComAndFiles(forum_id) {
  return sequelize.query(`
    SELECT
    	com.id,
      com.name,
      ir.title 			      AS ir_title,
      ir.comment 			    AS ir_comment,
      ir.org_name 		    AS ir_org_name,
      ir.name 		        AS ir_name,
      ir.path 			      AS ir_path,
      introduce.title 	  AS introduce_title,
      introduce.comment 	AS introduce_comment,
      introduce.org_name 	AS introduce_org_name,
      introduce.name 	    AS introduce_name,
      introduce.path 		  AS introduce_path
    FROM atten_coms AS com
    LEFT JOIN ir_files AS ir
    ON com.id = ir.atten_coms_id
    LEFT JOIN introduce_files AS introduce
    ON com.id = introduce.atten_coms_id
    WHERE com.forums_id = ${forum_id};
  `)
    .then(([result]) => result)
    .catch(error => null)
  }

function getQuestionComUser(pitching_id) {
  return sequelize.query(`
      SELECT
      	question.id,
      	question.comment,
        question.createdAt,
      	com.name AS com_name,
        user.name,
        user.email,
        user.phone
      FROM pitching_questions AS question
      LEFT JOIN atten_coms AS com
      ON question.atten_coms_id = com.id
      LEFT JOIN requests AS request
      ON question.requests_id = request.id
      LEFT JOIN users AS user
      ON request.users_id = user.id
      WHERE question.pitchings_id = ${pitching_id};
    `)
    .then(([result]) => result)
    .catch(error => null)
}
