module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    // username: {
    //   type: Sequelize.STRING,
    // },
    address: {
      type: Sequelize.STRING(100), // Độ dài tối đa 100 ký tự
      allowNull: false,
      unique: true, // Đảm bảo tính duy nhất
    },
    balance: {
      type: Sequelize.DECIMAL(20, 10),
      allowNull: true,
      defaultValue: 0,
    },
    balance_eth: {
      type: Sequelize.DECIMAL(20, 10),
      allowNull: true,
      defaultValue: 0,
    },
    balance_usdt: {
      type: Sequelize.DECIMAL(20, 10),
      allowNull: true,
      defaultValue: 0,
    },
    transferCode: {
      type: Sequelize.STRING,
    },
    securityCode: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    isMining: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    note: {
      type: Sequelize.STRING,
      defaultValue: "",
    },
    rank: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    referralCode: {
      type: Sequelize.STRING,
    },
    invitedCode: {
      type: Sequelize.STRING,
    },
    ipAddress: {
      type: Sequelize.STRING,
    },
    lastMiningTime: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });

  return User;
};
