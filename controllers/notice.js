/* Controller */
const Notice            = require("../models").notice;
const NoticeImg         = require("../models").notice_img;
const NoticeYt          = require("../models").notice_yt;
const utils             = require('../dist/utils.js');
const fs                = require('fs');
const uploadFile        = require("../dist/upload");
const Sequelize         = require("sequelize")
const sequelizeConfig   = require("../config/config.json")
const sequelize         = new Sequelize(sequelizeConfig.development);
const { Op }            = require("sequelize");


module.exports = {

  // 포럼 소식 상세
  async call(req, res) {
    if(!req.query.notice_id)
      res.status(901).send({message: "notice id required"})
    let where = { notices_id: req.query.notice_id }
    let imgs = new Array(), yts = new Array;

    let imgs_tmp =  await getNoticeImg(where);
    let yts_tmp =   await getNoticeYt(where);
    let info =      await getNoticeInfo({ id: req.query.notice_id});

    imgs_tmp.forEach(img => { imgs.push(img.dataValues) });
    yts_tmp.forEach(yt => { yts.push(yt.dataValues) })

    return res.status(200).send({img: imgs, yt: yts, notice: info});
  },

  // 포럼 소식 리스트
  call_list(req, res) {
    sequelize.query(`
      SELECT
      	notice.id AS id,
          notice.title AS title,
          notice.comment AS comment,
          img.id AS img_id,
          img.org_name AS img_org_name,
          img.name AS img_name,
          img.path AS img_path
      FROM notices AS notice
      LEFT JOIN (
      		SELECT
      			id AS id,
      			org_name AS org_name,
      			name AS name,
      			path AS path,
      			notices_id AS notices_id
      		FROM notice_imgs
      		GROUP BY notices_id
      		ORDER BY name ASC
          ) AS img
      ON notice.id = img.notices_id;
    `)
      .then(([result]) => res.status(200).send(result))
      .catch(error => res.status(500).send({message: error}))
  },

  table(req, res) {
    sequelize.query(`
      SELECT
      	notice.id AS id,
        notice.title AS title,
        notice.comment AS comment,
        notice.createdAt,
        DATE_FORMAT(notice.createdAt,'%Y-%m-%d') AS createdAt,
        img.id AS img_id,
        img.org_name AS img_org_name,
        img.name AS img_name,
        img.path AS img_path,
        @ROWNUM := @ROWNUM + 1 AS ROWNUM,
        (SELECT COUNT(*) FROM notices) AS total
      FROM notices AS notice
      LEFT JOIN (
    		SELECT
    			id AS id,
    			org_name AS org_name,
    			name AS name,
    			path AS path,
    			notices_id AS notices_id
    		FROM notice_imgs
    		GROUP BY notices_id
    		ORDER BY name ASC
        ) AS img
      ON notice.id = img.notices_id,
      (SELECT @ROWNUM := ${req.query.offset}) TMP
      ORDER BY notice.createdAt DESC
      LIMIT ${req.query.offset}, ${req.query.limit};
    `)
      .then(([result]) =>{
        if(result.length > 0)
          res.status(200).send({total: result[0].total, totalNotFiltered: result[0].total, rows: result})
        else
          res.status(200).send({total: 0, totalNotFiltered: 0, rows: []})
      })
      .catch(error => {
        console.log(error)
        res.status(500).send({message: error})
      });
  },

  // 포럼소식 이미지 라우팅
  img_view(req, res) {
    console.log(req.params.name);
    if(!req.params.name)
      res.status(901).send({message: "name is required"})
    fs.readFile(`/var/www/server/upload/notice/${req.params.name}`, (error, data) => {
      if(error)
        return res.status(500).send({message: error});
      res.send(data);
    })
  },

  // 포럼 소식 등록
  create(req, res) {
    let yt_links = [];
    if(req.body.yt_links && req.body.yt_links.length > 0)
      yt_links  = req.body.yt_links  // 소식 유튜브 링크

    if(!req.body.title)
      return res.status(901).send({message: "title is required"});
    if(!req.body.comment)
      return res.status(901).send({message: "comment is required"});

    // notice db insert
    Notice.create({
      title:    req.body.title,
      comment:  req.body.comment,
    })
      .then(notice => {
        //notice img db insert
        if(req.files) {
          req.files.forEach(file => {
            NoticeImg.create({
              org_name:   file.originalname,
              name:       file.filename,
              path:       file.destination,
              notices_id: notice.id,
            }).catch(error => console.log(error));
          });
        }
        //notice yt link db insert
        if(yt_links.length > 0){
          yt_links.forEach(yt_link => {
            NoticeYt.create({
              link:       yt_link,
              notices_id: notice.id,
            }).catch(error => console.log(error));
          })
        }

        return res.status(200).send({message: "submit success"});
      })
      .catch(error => res.status(500).send({message: `${error}`}));
  },

  // 포럼소식 수정
  async update(req, res) {
  // update(req, res) {
    console.log(req.file)
    console.log(req.files)
    console.log(req.body)

    if(!req.body.notice_id)
      return res.status(901).send({message: "notice id is required"});
    if(!req.body.title)
      return res.status(901).send({message: "title is required"});
    if(!req.body.comment)
      return res.status(901).send({message: "comment is required"});
    let yt_links = [];

    if(req.body.yt_links && req.body.yt_links.length > 0)
      yt_links = req.body.yt_links.split('|')  // 소식 유튜브 링크

    console.log(yt_links)
    console.log(yt_links.length)

    let where = { notices_id: req.body.notice_id };
    const t = await sequelize.transaction();


    try{
      // delete transaction
      // const t = await sequelize.transaction();

      let imgs_tmp =  await getNoticeImg(where);
      await NoticeYt.destroy(   { where: where, transaction: t });
      await NoticeImg.destroy(  { where: where, transaction: t });

      // upload img remove
      imgs_tmp.forEach(img => {
        fs.unlink(`${img.path}${img.name}`, function(err){
          if(err)
            console.log(err);
          console.log(`${img.name} deleted`);
        });
      });

      // transaction commit
      await t.commit();


      Notice.update({
        title :   req.body.title,
        comment : req.body.comment
      }, { where : { id: req.body.notice_id }})
        .then(notice => {
          //notice img db insert
          if(req.files && req.files.length > 0) {
            req.files.forEach(file => {
              NoticeImg.create({
                org_name:   file.originalname,
                name:       file.filename,
                path:       file.destination,
                notices_id: req.body.notice_id,
              }).catch(error => console.log(error));
            });
          }
          //notice yt link db insert
          if(yt_links.length > 0){
            yt_links.forEach(yt_link => {
              NoticeYt.create({
                link:       yt_link,
                notices_id: req.body.notice_id,
              }).catch(error => console.log(error));
            })
          }

          return res.status(200).send({message: "update success"});
        })
        .catch(error => res.status(500).send({message: `${error}`}));
    }
    catch(error) {
      await t.rollback();
      console.log(error)
      return res.status(500).send(error);
    }
  },

  // 포럼소식 삭제
  async delete(req, res) {
    if(!req.body.notice_id)
      return res.status(901).send({message: "notice id is requireed"});
    let where = { notices_id: req.body.notice_id };

    // delete transaction
    const t = await sequelize.transaction();
    try{
      let imgs_tmp =  await getNoticeImg(where);
      await NoticeYt.destroy(   { where: where, transaction: t });
      await NoticeImg.destroy(  { where: where, transaction: t });
      await Notice.destroy(     { where: { id: req.body.notice_id }, transaction: t });

      // upload img remove
      imgs_tmp.forEach(img => {
        fs.unlink(`${img.path}${img.name}`, function(err){
          if(err)
            console.log(err);
          console.log(`${img.name} deleted`);
        });
      });

      // transaction commit
      await t.commit();
      return res.status(200).send({message: "delete success"});
    }
    catch(error) {
      await t.rollback();
      return res.status(500).send(error);
    }
  },

  async(req,res){
    return Notice
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

function getNoticeImg(where) {
  return NoticeImg.findAll({ where: where })
    .then(imgs => imgs )
    .catch(error => null)
}

function getNoticeYt(where) {
  return NoticeYt.findAll({ where: where })
    .then(yts => yts)
    .catch(error => error)
}

function getNoticeInfo(where) {
  return Notice.findOne({ where: where})
    .then(notice => notice)
    .catch(error => null);
}
