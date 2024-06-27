module.exports = (sequelize, Sequelize) => {
  const Mining = sequelize.define("mining", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    type: {
      type: Sequelize.STRING,
    },
    amount_current: {
      type: Sequelize.DECIMAL(20, 10),
    },

    amount_take: {
      type: Sequelize.DECIMAL(20, 10),
    },
    is_take: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });

  return Mining;
};
