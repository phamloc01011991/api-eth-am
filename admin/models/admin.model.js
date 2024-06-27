module.exports = (sequelize, Sequelize) => {
  const Admin = sequelize.define("admins", {
    username: {
      type: Sequelize.STRING
    },
    fullName:{
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    role:{
      type: Sequelize.STRING
    },
    abilities: {
      type: Sequelize.JSON,
      defaultValue: { action: 'manage', subject: 'all' },
    },
  });

  return Admin;
};
