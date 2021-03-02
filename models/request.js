'use strict';
module.exports = (sequelize, DataTypes) => {
  const request = sequelize.define('request', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "참가신청 인덱스"
    },users_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "유저 인덱스",
      references: {
        model:{
          tableName:'users',
          key:'id'
        }
      },
    },forums_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "포럼 인덱스",
      references: {
        model:{
          tableName:'forums',
          key:'id'
        }
      },
    },auth_code: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "인증코드"
    },temperature: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "체온",
      defaultValue: 0,
    },off_participation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "오프라인 참가 ( 0: 불참, 1: 참가 )",
      defaultValue: 0,
    },on_participation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "온라인 참가 ( 0: 불참, 1: 참가 )",
      defaultValue: 0,
    },show: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: "신청자 보이기 (0: 노출안함, 1: 노출함)",
      defaultValue: 1,
    },

  }, {});
  request.associate = function(models) {
    // associations can be defined here
    request.belongsTo(models.user, {foreignKey: 'users_id'});
    request.belongsTo(models.forum, {foreignKey: 'forums_id'});
    request.hasMany(models.pitching_question, {foreignKey: 'requests_id', sourceKey: 'id'});
  };
  return request;
};
