'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('member_coms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "회원사 인덱스"
      },
      com_name: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "회원사 명"
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "대표자 이름"
      },
      info: {
        type: Sequelize.TEXT,
        comment: "회사소개"
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "대표자 연락처"
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "대표자 이메일"
      },
      interest: {
        allowNull: false,
        type: Sequelize.INTEGER,
        comment: "관심분야 (0: 없음, 1:네트워킹, 2:비즈니스 협업, 3:팀 빌딩, 4:정부 지원사업)",
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('member_coms');
  }
};
