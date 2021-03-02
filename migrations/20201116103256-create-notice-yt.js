'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('notice_yts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "포럼 소식 유튜브 인덱스"
      },
      notices_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'notices',
          key: 'id'
        },
        comment: "포럼 소식 인덱스"
      },
      link: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "포럼 소식 유튜브 링크"
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
    return queryInterface.dropTable('notice_yts');
  }
};