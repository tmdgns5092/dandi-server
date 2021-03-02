/* Controller */
const Atten             = require("../models").atten_com;
const Introduce         = require("../models").introduce_file;
const Ir                = require("../models").ir_file;
const fs                = require('fs');
const utils             = require('../dist/utils.js');
const Sequelize         = require("sequelize")
const sequelizeConfig   = require("../config/config.json")
const sequelize         = new Sequelize(sequelizeConfig.development);
const { Op }            = require("sequelize");


module.exports = {
  // 참여기업 상세
  async one(req, res) {
    if(!isNaN(parseInt(req.params.com_id))) {
      let where = { id: req.params.com_id }, data = {}
      let comInfo   = await findAttenCom(where);
      if(comInfo){
        let introduce = await findIntroduce({atten_coms_id: req.params.com_id});
        let ir        = await findIr({atten_coms_id: req.params.com_id});
        
        data.com        = comInfo;
        data.introduce  = introduce
        data.ir         = ir
        
        return res.status(200).send(data);
      } else {
        return res.status(200).send({message: `Not Found Atten Com (id = ${req.params.com_id})`})
      }
    }
    else 
      return res.status(900).send({message: "Exception Not number format"});
  },
  
  getIr(req, res) {
    if(!isNaN(parseInt(req.params.com_id))) {
      Ir.findOne({where: { atten_coms_id: req.params.com_id }})
        .then(ir => res.status(200).send(ir))
        .catch(error => res.status(500).send(error));
    } else {
      return res.status(200).send({message: `Not Found Atten Com (id = ${req.params.com_id})`})
    }
  },
  
  getIntro(req, res) {
    if(!isNaN(parseInt(req.params.com_id))) {
      Introduce.findOne({where: { atten_coms_id: req.params.com_id }})
        .then(introduce => res.status(200).send(introduce))
        .catch(error => res.status(500).send(error));
    } else {
      return res.status(200).send({message: `Not Found Atten Com (id = ${req.params.com_id})`})
    }
  },
  
  // 참여기업 리스트
  list(req, res) {
    if(!req.query.forum_id)
      return res.status(901).send({message: "forum_id is required"});
    let where = {forums_id: req.query.forum_id};
    Atten.findAll({ where: where })
      .then(coms => res.status(200).send(coms))
      .catch(error => {
        console.log(error) 
        return res.status(500).send(error)
        
      })
  },
  
  // 참여기업 등록
  async insert(req, res) {
    console.log()
    if(!req.body.forum_id) 
      return res.status(901).send({message: "forum_id is required"});
    if(!req.body.com_name) 
      return res.status(901).send({message: "com_name is required"});
    
    let create = {
      forums_id: req.body.forum_id,
      name:      req.body.com_name,
    }
    let findCom = await findAttenCom(create);
    
    if(findCom)
      return res.status(200).send({ message: "Already a atten_com"});
    else
      Atten.create(create)
        .then(com => res.status(200).send({message: `${create.name} create Member Success`, com: com}))
        .catch(error => {
          console.log(error)
          res.status(500).send(error)
          
        })
  },
  
  // 참여기업 업데이트
  async update(req, res) {
    if(!isNaN(parseInt(req.params.com_id))) {
      if(!req.body.name)
        return res.status(901).send({message: "name is required"});
      
      let where = {id: req.params.com_id};
      let findCom = await findAttenCom(where);
      
      if(findCom){
        let update = { name: req.body.name };
        Atten.update(update, {where: where})
          .then(() => res.status(200).send({message: "atten com update success"}))
          .catch(error => res.status(500).send(error))
      }
      else
        return res.status(200).send({message: `Not Found Atten Com (id = ${req.params.com_id})`})
    }
    else 
      return res.status(900).send({message: "Exception Not number format"});
  },
  
  // 참여기업 삭제
  async delete(req, res) {
    if(!isNaN(parseInt(req.params.com_id))) {
      let where = { atten_coms_id: req.body.com_id };
      
      // delete transaction
      const t = await sequelize.transaction();
      try{
        // ir img remove
        Ir.findAll({where: {atten_coms_id: req.params.com_id}})
          .then(irs => {
            irs.forEach(ir => {
              fs.unlink(`${ir.path}${ir.name}`, function(err){
                if(err) 
                  console.log(err);
                console.log(`${ir.name} deleted`);
              });
            })
          })
          .catch(error => { console.log(error) })
          
        // introduce img remove
        Introduce.findAll({where: {atten_coms_id: req.params.com_id}})
          .then(ints => {
            ints.forEach(int => {
              fs.unlink(`${int.path}${int.name}`, function(err){
                if(err) 
                  console.log(err);
                console.log(`${int.name} deleted`);
              });
            })
          })
          .catch(error => { console.log(error) })
        
        await Ir.destroy({ where: {atten_coms_id: req.params.com_id}, transaction: t });
        await Introduce.destroy(  { where: {atten_coms_id: req.params.com_id}, transaction: t });
        await Atten.destroy(     { where: { id: req.params.com_id }, transaction: t });
        // transaction commit
        await t.commit();
        return res.status(200).send({message: "delete success"});
      }
      catch(error) {
        console.log(error)
        await t.rollback();
        return res.status(500).send(error);
      }
    }
    else
      return res.status(900).send({message: "Exception Not number format"});
  },
  
  irDownload(req, res) {
    const fileName = req.params.name;
    const directoryPath = __basedir + "/upload/ir/";
  
    res.download(directoryPath + fileName, fileName, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  },
  
  introduceDownload(req, res) {
    const fileName = req.params.name;
    const directoryPath = __basedir + "/upload/introduce/";
  
    res.download(directoryPath + fileName, fileName, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
    });
  },
  
  // 참여기업 ir자료 업로드 
  async irInsert(req, res) {
    if(!isNaN(parseInt(req.params.com_id))) {
      if(!req.files || req.files.length < 1)
        return res.status(901).send({message: "ir file is required"});
      let where = { id: req.params.com_id }
      let files = req.files;
      let com = await findAttenCom(where);
      let title = '', comment = '';
      
      // 기존 ir 삭제
      let ir = await findIrOne({atten_coms_id: req.params.com_id});
      if(ir){
        // upload img remove
        fs.unlink(`${ir.path}${ir.name}`, function(err){
          if(err) {
            console.log(err);
            return res.status(500).send(err);
          }
          console.log(`${ir.name} delete`);
        });
        Ir.destroy({where: {id: ir.id}}).then(() => { console.log(`${ir.id} delete`) });
      }
      
      if(req.body.title)
        title = req.body.title
      if(req.body.comment)
        comment = req.body.comment
      
      if(com){
        let create = new Array();
        
        files.some(file => {
          create.push({
            atten_coms_id:  req.params.com_id,
            title:          title,
            comment:        comment,
            org_name:       file.originalname,
            name:           file.filename,
            path:           file.destination,
          })
        })
        
        Ir.bulkCreate(create)
          .then(() => res.status(200).send({message: "ir file upload success"}))
          .catch(error => res.status(500).send(error));
          
      } else 
        return res.status(200).send({message: `Not Found Atten Com (id = ${req.params.com_id})`})
    }
    else 
      return res.status(900).send({message: "Exception Not number format"});
  },
  // 참여기업 소개자료 업로드
  async introduceInsert(req, res) {
    if(!isNaN(parseInt(req.params.com_id))) {
      if(!req.files || req.files.length < 1)
        return res.status(901).send({message: "introduce file is required"});
      let where = { id: req.params.com_id }
      let files = req.files;
      let com = await findAttenCom(where);
      let title = '', comment = '';
      
      // 기존 ir 삭제
      let it = await findIntroduceOne({atten_coms_id: req.params.com_id});
      if(it){
        // upload img remove
        fs.unlink(`${it.path}${it.name}`, function(err){
          if(err) {
            console.log(err);
            return res.status(500).send(err);
          }
          console.log(`${it.name} delete`);
        });
        Introduce.destroy({where: { id: it.id }}).then(() => { console.log(`${it.id} delete`) });
      }
      
      if(req.body.title)
        title = req.body.title
      if(req.body.comment)
        comment = req.body.comment
      
      if(com){
        let create = new Array();
        
        files.some(file => {
          create.push({
            atten_coms_id:  req.params.com_id,
            title:          title,
            comment:        comment,
            org_name:       file.originalname,
            name:           file.filename,
            path:           file.destination,
          })
        })
        
        Introduce.bulkCreate(create)
          .then(file => res.status(200).send({message: "introduce file upload success", file: file}))
          .catch(error => res.status(500).send(error));
      } else 
        return res.status(200).send({message: `Not Found Atten Com (id = ${req.params.com_id})`})
    }
    else 
      return res.status(900).send({message: "Exception Not number format"});
  },
  
  // ir 자료 삭제
  async irDelete(req, res) {
    if(!isNaN(parseInt(req.params.ir_id))) {
      let where = { id: req.params.ir_id };
      let ir_file =  await findIrOne(where);
      
      if(ir_file){
        // upload img remove
        fs.unlink(`${ir_file.path}${ir_file.name}`, function(err){
          if(err) {
            console.log(err);
            return res.status(500).send(err);
          }
          console.log(`${ir_file.name} deleted`);
        });
        return res.status(200).send({message: "delete success"});
      } else 
        return res.status(200).send({message: `Not Found Atten Com (id = ${req.params.ir_id})`})
    }
    else
      return res.status(900).send({message: "Exception Not number format"});
  },
  // 소개 자료 삭제
  async introduceDelete(req, res) {
    if(!isNaN(parseInt(req.params.introduce_id))) {
      let where = { id: req.params.introduce_id };
      let introduce_file =  await findIntroduceOne(where);
      
      if(introduce_file){
        // upload img remove
        fs.unlink(`${introduce_file.path}${introduce_file.name}`, function(err){
          if(err) {
            console.log(err);
            return res.status(500).send(err);
          }
          console.log(`${introduce_file.name} deleted`);
        });
        return res.status(200).send({message: "delete success"});
      } else 
        return res.status(200).send({message: `Not Found Atten Com (id = ${req.params.introduce_id})`})
    }
    else
      return res.status(900).send({message: "Exception Not number format"});
  },
  
  async(req,res){
    return Atten
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

function findAttenCom(where) {
  return Atten.findOne({where: where})
    .then(com => com)
    .catch(error => null);
}

function findIntroduce(where) {
  return Introduce.findAll({where: where})
    .then(intr => intr)
    .catch(error => null);
}

function findIr(where) {
  return Ir.findAll({where: where})
    .then(ir => ir)
    .catch(error => null);
}

function findIrOne(where) {
  return Ir.findOne({where: where})
    .then(ir => ir)
    .catch(error => null);
}

function findIntroduceOne(where) {
  return Introduce.findOne({where: where})
    .then(introduce => introduce)
    .catch(error => null)
}
