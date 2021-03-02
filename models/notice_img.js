'use strict';
module.exports = (sequelize, DataTypes) => {
  const notice_img = sequelize.define('notice_img', {
    id: {       
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true, 
      allowNull: false,
      comment: "포럼 소식 이미지 인덱스"
    },org_name: {    
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "포럼 소식 이미지 기존 이름"
    },name: {    
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "포럼 소식 이미지 인덱스"
    },path: {    
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "포럼 소식 이미지 위치"
    },notices_id: {    
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: "포럼 소식 인덱스",
      references: { 
        model:{ 
          tableName:'notices',
          key:'id'
        }
      },
    },
  }, {});
  notice_img.associate = function(models) {
    // associations can be defined here
    notice_img.belongsTo(models.notice, {foreignKey: 'notices_id'});
  };
  return notice_img;
};