'use strict';
module.exports = (sequelize, DataTypes) => {
  const vip = sequelize.define('vip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "VIP 인덱스"
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "VIP 이름"
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "VIP 이메일"
    },
    com_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "VIP 회사 명"
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "VIP 직책"
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "VIP 휴대폰"
    },
    auth_code: {
      type: DataTypes.STRING,
      comment: "VIP 인증코드"
    },temperature: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "체온",
      defaultValue: 0,
    }
  }, {});
  vip.associate = function(models) {
    // associations can be defined here
  };
  return vip;
};
