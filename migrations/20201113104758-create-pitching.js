'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('pitchings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "피칭 인덱스",
      },
      forums_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "포럼 인덱스",
        references: {
          model: 'forums',
          key: 'id'
        },
      },
      yt_link: {
        type: Sequelize.TEXT,
        comment: "실시간 스트리밍 링크",
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
    return queryInterface.dropTable('pitchings');
  }
};