module.exports = (sequelize, Sequelize) => {
  const Member = sequelize.define("member", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      unique: true,
    },
    group: {
      type: Sequelize.TEXT("tiny"),
    },
  });
  return Member;
};
