'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('forum_imgs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "포럼 이미지 인덱스"
      },
      org_name: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "포럼 이미지 기존 이름"
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "포럼 이미지 이름"
      },
      path: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "포럼 이미지 위치"
      },
      forums_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "포럼 이미지 인덱스",
        references: {
          model: 'forums',
          key: 'id'
        },
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
    return queryInterface.dropTable('forum_imgs');
  }
};