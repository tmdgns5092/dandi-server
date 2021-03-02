'use strict';
module.exports = (sequelize, DataTypes) => {
  const pitching_question = sequelize.define('pitching_question', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "질문 인덱스",
    },
    pitchings_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "피칭 인덱스",
      references: {
        model:{
          tableName:'pitchings',
          key:'id'
        }
      }
    },
    atten_coms_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "피칭 기업 인덱스",
      references: {
        model:{
          tableName:'atten_coms',
          key:'id'
        }
      }
    },
    requests_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "질문 요청 인덱스",
      references: {
        model:{
          tableName:'requests',
          key:'id'
        }
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "질문 본문",
    },
    is_vip: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: "유저 타입 확인",
    },
  }, {});
  pitching_question.associate = function(models) {
    // associations can be defined here
    pitching_question.belongsTo(models.pitching, {foreignKey: 'pitchings_id'});
    pitching_question.belongsTo(models.atten_com, {foreignKey: 'atten_coms_id'});
    pitching_question.belongsTo(models.request, {foreignKey: 'requests_id'});
  };
  return pitching_question;
};
