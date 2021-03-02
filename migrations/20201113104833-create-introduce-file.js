'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('introduce_files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "소개자료 인덱스",
      },
      title: {
        type: Sequelize.STRING,
        comment: "소개자료 제목",
      },
      comment: {
        type: Sequelize.STRING,
        comment: "소개자료 본문",
      },
      atten_coms_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "소개자료 참여기업 인덱스",
        references: {
          model: 'atten_coms',
          key: 'id'
        },
      },
      org_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "소개자료 기존 파일명",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "소개자료 파일명",
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "소개자료 파일위치",
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
    return queryInterface.dropTable('introduce_files');
  }
};