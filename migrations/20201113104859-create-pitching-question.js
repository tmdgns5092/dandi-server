'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('pitching_questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: "질문 인덱스",
      },
      pitchings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "피칭 인덱스",
        references: {
          model: 'pitchings',
          key: 'id'
        },
      },
      atten_coms_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "피칭 기업 인덱스",
        references: {
          model: 'atten_coms',
          key: 'id'
        },
      },
      requests_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "질문 요청 인덱스",
        references: {
          model: 'requests',
          key: 'id'
        },
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "질문 본문",
      },
      is_vip: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: "유저 타입 확인",
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
    return queryInterface.dropTable('pitching_questions');
  }
};
