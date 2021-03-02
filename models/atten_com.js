'use strict';
module.exports = (sequelize, DataTypes) => {
  const atten_com = sequelize.define('atten_com', {
    id: {       
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true, 
      allowNull: false,
      comment: "그룹 인덱스"
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
    }, name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "참여 기업 이름"
    }
  }, {});
  atten_com.associate = function(models) {
    // associations can be defined here
    atten_com.belongsTo(models.forum, {foreignKey: 'forums_id'});
    
    atten_com.hasMany(models.ir_file, {foreignKey: 'atten_coms_id', sourceKey: 'id'});  
    atten_com.hasMany(models.introduce_file, {foreignKey: 'atten_coms_id', sourceKey: 'id'});  
    atten_com.hasMany(models.pitching_question, {foreignKey: 'atten_coms_id', sourceKey: 'id'});  
  };
  return atten_com;
};