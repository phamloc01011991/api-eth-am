module.exports = (sequelize, Sequelize) => {
  const Staking = sequelize.define("staking", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dateHold: {
      type: Sequelize.INTEGER,
    },
    interestRate: {
      type: Sequelize.FLOAT,
    },
    type: {
      type: Sequelize.STRING,
      optional: true,
    },
    description: {
      type: Sequelize.STRING,
    },
  });
  return Staking;
};
