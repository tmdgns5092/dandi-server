'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('notice_imgs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "포럼 소식 인덱스"
      },
      org_name: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "포럼 소식 기존 이름"
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "포럼 소식 이미지 이름"
      },
      path: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: "포럼 소식 이미지 위치"
      },
      notices_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "포럼 소식 인덱스",
        references: {
          model: 'notices',
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
    return queryInterface.dropTable('notice_imgs');
  }
};