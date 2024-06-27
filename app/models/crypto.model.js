module.exports = (sequelize, Sequelize) => {
  const Crypto = sequelize.define("crypto", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    coin_id: {
      type: Sequelize.STRING,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    symbol: {
      type: Sequelize.STRING,
    },
    image: {
      type: Sequelize.STRING,
    },
    current_price: {
      type: Sequelize.DECIMAL(20, 10),
    },
    market_cap: {
      type: Sequelize.BIGINT,
    },
    market_cap_rank: {
      type: Sequelize.INTEGER,
    },
    fully_diluted_valuation: {
      type: Sequelize.BIGINT,
      allowNull: true,
    },
    total_volume: {
      type: Sequelize.BIGINT,
    },
    high_24h: {
      type: Sequelize.DECIMAL(20, 10),
    },
    low_24h: {
      type: Sequelize.DECIMAL(20, 10),
    },
    price_change_24h: {
      type: Sequelize.DECIMAL(20, 10),
    },
    price_change_percentage_24h: {
      type: Sequelize.DECIMAL(20, 10),
    },
    market_cap_change_24h: {
      type: Sequelize.DECIMAL(30, 10),
    },
    market_cap_change_percentage_24h: {
      type: Sequelize.DECIMAL(20, 10),
    },
    circulating_supply: {
      type: Sequelize.DECIMAL(30, 10),
    },
    total_supply: {
      type: Sequelize.DECIMAL(30, 10),
      allowNull: true,
    },
    max_supply: {
      type: Sequelize.DECIMAL(30, 10),
      allowNull: true,
    },
    ath: {
      type: Sequelize.DECIMAL(20, 10),
    },
    ath_change_percentage: {
      type: Sequelize.DECIMAL(20, 10),
    },
    ath_date: {
      type: Sequelize.DATE,
    },
    atl: {
      type: Sequelize.DECIMAL(20, 10),
    },
    atl_change_percentage: {
      type: Sequelize.DECIMAL(20, 10),
    },
    atl_date: {
      type: Sequelize.DATE,
    },
    last_updated: {
      type: Sequelize.DATE,
    },
    roi: {
      type: Sequelize.JSON,
      defaultValue: {},
      allowNull: true,
    },
  });

  return Crypto;
};
