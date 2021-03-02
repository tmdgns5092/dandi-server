'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('atten_coms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "참여그룹 아이디",
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "참여 기업 이름"
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
    return queryInterface.dropTable('atten_coms');
  }
};