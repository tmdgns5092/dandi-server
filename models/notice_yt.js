'use strict';
module.exports = (sequelize, DataTypes) => {
  const notice_yt = sequelize.define('notice_yt', {
    id: {       
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true, 
      allowNull: false,
      comment: "포럼 소식 유튜브 인덱스"
    },link: {  
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "포럼 소식 유튜브 링크"
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
    }
  }, {});
  notice_yt.associate = function(models) {
    // associations can be defined here
    notice_yt.belongsTo(models.notice, {foreignKey: 'notices_id'});
  };
  return notice_yt;
};