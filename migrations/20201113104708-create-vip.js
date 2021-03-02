'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('vips', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "VIP 인덱스"
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "VIP 이름"
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "VIP 이메일"
      },
      com_name: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "VIP 회사 명"
      },
      position: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "VIP 직책"
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "VIP 휴대폰"
      },
      auth_code: {
        type: Sequelize.STRING,
        comment: "VIP 인증코드"
      },
      temperature: {
        type: Sequelize.STRING,
        comment: "체온",
        defaultValue: 0,
        allowNull: false,
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
    return queryInterface.dropTable('vips');
  }
};
