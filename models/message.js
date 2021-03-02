'use strict';
module.exports = (sequelize, DataTypes) => {
  const message = sequelize.define('message', {
    reciptNum: DataTypes.STRING
  }, {});
  message.associate = function(models) {
    // associations can be defined here
  };
  return message;
};