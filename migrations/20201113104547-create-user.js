'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "유저 이름"
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "유저 이메일 주소"
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "유저 연락처"
      },
      com_name: {
        type: Sequelize.STRING,
        comment: "유저 회사 명"
      },
      position: {
        type: Sequelize.STRING,
        comment: "유저 직책"
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
    return queryInterface.dropTable('users');
  }
};