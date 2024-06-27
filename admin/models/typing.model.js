module.exports = (sequelize, Sequelize) => {
  const Typing = sequelize.define("typing", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mouse: {
      type: Sequelize.INTEGER,
    },
    keyboard: {
      type: Sequelize.INTEGER,
    },
    member_id: {
      type: Sequelize.INTEGER,
    },
  });
  return Typing;
};
