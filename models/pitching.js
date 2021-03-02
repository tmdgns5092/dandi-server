'use strict';
module.exports = (sequelize, DataTypes) => {
  const pitching = sequelize.define('pitching', {
    id: {       
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true, 
      allowNull: false,
      comment: "피칭 인덱스"
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
    }, yt_link: {
      type: DataTypes.TEXT,
      comment: "실시간 스트리밍 링크",
    }
  }, {});
  pitching.associate = function(models) {
    // associations can be defined here
    pitching.belongsTo(models.forum, {foreignKey: 'forums_id'});
    pitching.hasMany(models.pitching_question, {foreignKey: 'pitchings_id', sourceKey: 'id'});
  };
  return pitching;
};