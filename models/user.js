'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id: {       
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true, 
      allowNull: false,
      comment: "유저 인덱스"
    },
    name: {       
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "유저 이름"
    },
    email: {       
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "유저 이메일"
    },
    phone: {       
      type: DataTypes.STRING, 
      allowNull: false,
      comment: "유저 핸드폰"
    },
    com_name: {       
      type: DataTypes.STRING, 
      comment: "유저 회사 명"
    },
    position: {       
      type: DataTypes.STRING, 
      comment: "유저 직책"
    },
  }, {});
  user.associate = function(models) {
    // associations can be defined here
    // requests
    user.hasMany(models.request, {foreignKey: 'users_id', sourceKey: 'id'});  
  };
  return user;
};