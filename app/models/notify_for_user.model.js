module.exports = (sequelize, Sequelize) => {
  const notify_for_user = sequelize.define("notify_for_user", {
    user_id: {
      type: Sequelize.INTEGER,
    },
    title: {
      type: Sequelize.STRING,
    },
    titleEnglish: {
      type: Sequelize.STRING,
    },
    content: {
      type: Sequelize.TEXT,
    },
    contentEnglish: {
      type: Sequelize.TEXT,
    },
    status: {
      type: Sequelize.INTEGER,
      deffaultValue: 0,
    },
  });
  return notify_for_user;
};
