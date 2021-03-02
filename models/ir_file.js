'use strict';
module.exports = (sequelize, DataTypes) => {
  const ir_file = sequelize.define('ir_file', {
    id: {       
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true, 
      allowNull: false,
      comment: "IR 자료 인덱스"
    },atten_coms_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "참여기업 인덱스",
      references: { 
        model:{ 
          tableName:'atten_coms',
          key:'id'
        }
      }
    },title: {
      type: DataTypes.STRING,
      comment: "IR 자료 제목"
    },comment: {
      type: DataTypes.STRING,
      comment: "IR 자료 본문"
    },org_name: {
      allowNull: false,
      type: DataTypes.STRING,
      comment: "IR 자료 기존 파일명"
    },name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "IR 자료 파일명"
    },path: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "IR 자료 파일 위치"
    }
  }, {});
  ir_file.associate = function(models) {
    // associations can be defined here
    ir_file.belongsTo(models.atten_com, {foreignKey: 'atten_coms_id'});
  };
  return ir_file;
};