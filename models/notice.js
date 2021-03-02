'use strict';
module.exports = (sequelize, DataTypes) => {
  const notice = sequelize.define('notice', {
    id: {       
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true, 
      allowNull: false,
      comment: "포럼소식 인덱스"
    },
    title: {       
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "포럼소식 제목"
    },
    comment: {       
      type: DataTypes.TEXT, 
      allowNull: false,
      comment: "포럼소식 본문"
    },
    count: {       
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: "포럼소식 조회수",
      defaultValue: 0
    },
  }, {});
  notice.associate = function(models) {
    // associations can be defined here
    notice.hasMany(models.notice_img, {foreignKey: 'notices_id', sourceKey: 'id'});
    notice.hasMany(models.notice_yt, {foreignKey: 'notices_id', sourceKey: 'id'});
  };
  return notice;
};