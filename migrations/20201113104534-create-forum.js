'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('forums', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "포럼 타이틀"
      },
      start_date: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: "포럼 시작날짜"
      },
      end_date: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: "포럼 종료날짜"
      },
      status: {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.INTEGER,
        comment: "0: 미사용, 1: 사용",
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
    return queryInterface.dropTable('forums');
  }
};
