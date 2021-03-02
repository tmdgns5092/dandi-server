/* Controller */
const Question          = require("../models").pitching_question;
const Pitching          = require("../models").pitching;
const utils             = require('../dist/utils.js');
const Sequelize         = require("sequelize")
const sequelizeConfig   = require("../config/config.json")
const sequelize         = new Sequelize(sequelizeConfig.development);
const { Op }            = require("sequelize");


module.exports = {
    // 피칭 단일 질문 호출
    async one(req, res) {
      if(!isNaN(parseInt(req.params.question_id))) {
        let where = { id: req.params.question_id };
        let question = await findQuestionOne(where);

        if(question)
          return res.status(200).send(question)
        else
          return res.status(200).send({message: `Not Found Question (id = ${req.params.question_id})`})
      }
      else
        return res.status(900).send({message: "Exception Not number format"});
    },

    // 피칭의 해당 기업 질문 호출
    comOne(req, res) {
      if(!isNaN(parseInt(req.params.pitchings_id)) || !isNaN(parseInt(req.params.com_id))) {
        let where = {
          pitchings_id:   req.params.pitchings_id,
          atten_coms_id:  req.params.com_id
        }
        Question.findAll({where: where})
          .then(questions => res.status(200).send(questions))
          .catch(error => res.status(500).send(error));
      }
      else
        return res.status(900).send({message: "Exception Not number format"});
    },

    // 피칭의 전체 질문 호출
    list(req, res) {
      if(!isNaN(parseInt(req.params.pitchings_id))) {
        let where = { pitchings_id: req.params.pitchings_id }
        Question.findAll({where: where})
          .then(questions => res.status(200).send(questions))
          .catch(error => res.status(500).send(error));
      }
      else
        return res.status(900).send({message: "Exception Not number format"});
    },

    // 질문 등록
    insert(req, res) {
      console.log(req.body)
      if(!isNaN(parseInt(req.params.pitchings_id))) {
        if(!req.body.id)
          return res.status(901).send({message: "id is required"});
        if(!req.body.com_id)
          return res.status(901).send({message: "com_id is required"});
        if(!req.body.comment)
          return res.status(901).send({message: "comment is required"});
        // if(!req.body.is_vip)
        //   return res.status(901).send({message: "is_vip is required"});

        let create = {
          pitchings_id:   req.params.pitchings_id,
          atten_coms_id:  req.body.com_id,
          requests_id:    req.body.id,
          comment:        req.body.comment,
          is_vip:         req.body.is_vip,
        }
        console.log(create);
        Question.create(create)
          .then(() => res.status(200).send({message: "submit success"}))
          .catch(error => {
            console.log(error)
            res.status(500).send(error)
          });
      }
      else
        return res.status(900).send({message: "Exception Not number format"});
    },

    // 질문 업데이트
    async update(req, res) {
      if(!isNaN(parseInt(req.params.question_id))) {
        if(!req.body.comment)
          return res.status(901).send({message: "request_id is required"});

        let where = { id: req.params.question_id };
        let question = await findQuestionOne(where);
        if(question)
          question.update({ comment: req.body.comment })
            .then(() => res.status(200).send({message: "update success"}))
            .catch(error => res.status(500).send(error))
        else
          return res.status(200).send({message: `Not Found Question (id = ${req.params.question_id})`})
      }
      else
        return res.status(900).send({message: "Exception Not number format"});
    },

    // 질문 삭제
    async delete(req, res) {
      if(!isNaN(parseInt(req.params.question_id))) {
        let where = { id: req.params.question_id };
        let question = await findQuestionOne(where);

        if(question)
          question.destroy()
            .then(() => res.status(200).send({mesasge: "delete success"}))
            .catch(error => res.status(500).send(error))
        else
          return res.status(200).send({message: `Not Found Question (id = ${req.params.question_id})`})
      }
      else
        return res.status(900).send({message: "Exception Not number format"});
    },

    // 테이블 출력용 질문
    table(req, res) {
      if(!isNaN(parseInt(req.params.forum_id))) {
        Pitching.findOne({where: {forums_id:req.params.forum_id}})
          .then(pitching => {
            if(pitching)
              sequelize.query(`
                SELECT
                	question.id,
                	question.comment,
                  question.createdAt,
                  question.is_vip,
                	com.name AS com_name,
                  user.name,
                  user.email,
                  user.phone,
                  user.com_name AS user_com_name,
                  vip.name AS vip_name,
                  vip.email AS vip_email,
                  vip.phone AS vip_phone,
                  vip.com_name AS vip_com_name,
                  (SELECT COUNT(*) FROM pitching_questions WHERE pitchings_id = ${pitching.id}) AS total
                FROM pitching_questions AS question
                LEFT JOIN atten_coms AS com
                ON question.atten_coms_id = com.id
                LEFT JOIN requests AS request
                ON question.requests_id = request.id
                LEFT JOIN users AS user
                ON request.users_id = user.id
                LEFT JOIN vips AS vip
                ON question.requests_id = vip.id
                WHERE question.pitchings_id = ${pitching.id}
                ORDER BY question.createdAt DESC
                LIMIT ${req.query.offset}, ${req.query.limit};
              `)
              .then(([result]) => {
                if(result.length > 0)
                  res.status(200).send({total: result[0].total, totalNotFiltered: result[0].total, rows: result})
                else
                  res.status(200).send({total: 0, totalNotFiltered: 0, rows: []})
              })
              .catch(error => {
                console.log(error)
                return res.status(500).send(error);
              })
            else
              return res.status(200).send({total: 0, totalNotFiltered: 0, rows: []})
          })
          .catch(error => {
            console.log(error)
            return res.status(500).send(error)
          })
      }
      else
        return res.status(900).send({message: "Exception Not number format"});
    },

    async(req,res){
      return Question
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

function findQuestionOne(where) {
    return Question.findOne({where: where})
      .then(pitching => pitching)
      .catch(error => null)
}

function getQuestionComUser(pitching_id) {

}
