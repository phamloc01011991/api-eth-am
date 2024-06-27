module.exports = (sequelize, Sequelize) => {
  const configInterest = sequelize.define("config_interest", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    level: {
      type: Sequelize.INTEGER,
    },
    valueMin: {
      type: Sequelize.DECIMAL(20, 10),
      allowNull: false,
    },
    valueMax: {
      type: Sequelize.DECIMAL(20, 10),
      allowNull: false,
    },
    percentMin: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    percentMax: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
  });
  return configInterest;
};
