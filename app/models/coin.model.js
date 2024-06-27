module.exports = (sequelize, Sequelize) => {
  const Coin = sequelize.define("coins", {
    symbol: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: "0",
    },
    prefix: {
      type: Sequelize.STRING,
      defaultValue: "FX",
    },
    data: {
      type: Sequelize.JSON,
      defaultValue: {},
    },
  });

  return Coin;
};
