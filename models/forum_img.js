'use strict';
module.exports = (sequelize, DataTypes) => {
  const forum_img = sequelize.define('forum_img', {
    id: {       
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true, 
      allowNull: false,
      comment: "포럼 이미지 인덱스"
    },org_name: {    
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "포럼 이미지 기존 이름"
    },name: {    
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "포럼 이미지 인덱스"
    },path: {    
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "포럼 이미지 위치"
    },forums_id: {    
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: "포럼 이미지 인덱스",
      references: { 
        model:{ 
          tableName:'forums',
          key:'id'
        }
      },
    },
  }, {});
  forum_img.associate = function(models) {
    // associations can be defined here
    forum_img.belongsTo(models.forum, {foreignKey: 'forums_id'});
  };
  return forum_img;
};