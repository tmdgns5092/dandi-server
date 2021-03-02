'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ir_files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "IR 자료 인덱스",
      },
      atten_coms_id: {
        type: Sequelize.INTEGER,
        comment: "참여기업 인덱스",
        allowNull: false,
        references: {
          model: 'atten_coms',
          key: 'id'
        },
      },
      title: {
        type: Sequelize.STRING,
        comment: "IR 자료 제목"
      },
      comment: {
        type: Sequelize.STRING,
        comment: "IR 자료 본문"
      },
      org_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "IR 자료 기존 파일명"
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "IR 자료 파일명"
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "IR 자료 파일 위치"
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
    return queryInterface.dropTable('ir_files');
  }
};