module.exports = (sequelize, Sequelize) => {
  const StakingUser = sequelize.define("staking_user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    staking_id: {
      type: Sequelize.INTEGER,
    },
    balance_hold: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    balance_take: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    date_end: {
      type: Sequelize.DATE,
    },
  });

  return StakingUser;
};
