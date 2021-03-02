'use strict';
module.exports = (sequelize, DataTypes) => {
  const member_com = sequelize.define('member_com', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "회원사 인덱스"
    },
    com_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "회원사 명"
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "대표자 이름"
    },
    info: {
      type: DataTypes.TEXT,
      comment: "회사소개"
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "대표자 연락처"
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "대표자 이메일"
    },
    interest: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "관심분야 (0: 없음, 1:네트워킹, 2:비즈니스 협업, 3:팀 빌딩, 4:정부 지원사업)",
      defaultValue: 0,
    }
  }, {});
  member_com.associate = function(models) {
    // associations can be defined here
  };
  return member_com;
};
