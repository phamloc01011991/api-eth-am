module.exports = (sequelize, Sequelize) => {
  const TrackingBalance = sequelize.define("tracking_balance", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
  });
  return TrackingBalance;
};
