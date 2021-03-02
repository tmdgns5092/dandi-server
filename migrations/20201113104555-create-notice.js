'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('notices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "포럼소식 인덱스"
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "포럼소식 제목"
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "포럼소식 본문"
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "포럼소식 조회수",
        defaultValue: 0
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
    return queryInterface.dropTable('notices');
  }
};