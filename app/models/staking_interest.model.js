module.exports = (sequelize, Sequelize) => {
  const StakingUser = sequelize.define("staking_interest", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    staking_user_id: {
      type: Sequelize.INTEGER,
    },
    balance_interest: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    is_taked: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });

  return StakingUser;
};
