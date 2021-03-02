'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "참가신청 인덱스",
      },
      users_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "유저 인덱스",
        references: {
          model: 'users',
          key: 'id'
        },
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
      auth_code: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "인증코드"
      },
      temperature: {
        type: Sequelize.STRING,
        comment: "체온",
        defaultValue: 0,
        allowNull: false,
      },off_participation: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "오프라인 참가 ( 0: 불참, 1: 참가 )",
        defaultValue: 0,
      },on_participation: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "온라인 참가 ( 0: 불참, 1: 참가 )",
        defaultValue: 0,
      },show: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: "신청자 보이기 (0: 노출안함, 1: 노출함)",
        defaultValue: 1,
      },createdAt: {
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
    return queryInterface.dropTable('requests');
  }
};
