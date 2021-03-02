'use strict';
module.exports = (sequelize, DataTypes) => {
  const forums = sequelize.define('forum', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "포럼 인덱스"
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "포럼 타이틀"
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "포럼 시작날짜"
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "포럼 종료날짜"
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "0: 미사용, 1: 사용",
    }
  }, {});
  forums.associate = function(models) {
    // associations can be defined here
    // forum_imgs
    forums.hasMany(models.forum_img, {foreignKey: 'forums_id', sourceKey: 'id'});
    // atten_coms
    forums.hasMany(models.atten_com, {foreignKey: 'forums_id', sourceKey: 'id'});
    // pitchings
    forums.hasMany(models.pitching, {foreignKey: 'forums_id', sourceKey: 'id'});
    // requests
    forums.hasMany(models.request, {foreignKey: 'forums_id', sourceKey: 'id'});
  };
  return forums;
};
