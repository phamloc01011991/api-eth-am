module.exports = (sequelize, Sequelize) => {
  const Blog = sequelize.define("blog", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
    },
    titleEnglish: {
      type: Sequelize.STRING,
    },
    slug: {
      type: Sequelize.STRING,
      unique: true,
    },
    featuredImage: {
      type: Sequelize.STRING,
    },
    actived: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    description: {
      type: Sequelize.TEXT,
    },
    descriptionEnglish: {
      type: Sequelize.TEXT,
    },
  });
  return Blog;
};
