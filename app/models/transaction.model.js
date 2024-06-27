module.exports = (sequelize, Sequelize) => {
  const transaction = sequelize.define("transaction", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    code: {
      type: Sequelize.STRING,
    },
    source: {
      type: Sequelize.STRING,
    },
    target: {
      type: Sequelize.STRING,
    },
    typeTransaction: {
      type: Sequelize.ENUM(
        "toup",
        "withdrawal",
        "transfer",
        "reward",
        "mining"
      ),
    },
    amount: {
      type: Sequelize.DECIMAL(20, 10),
    },
    status: {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    note: {
      type: Sequelize.JSON,
      defaultValue: {},
      allowNull: true,
    },
  });

  return transaction;
};
