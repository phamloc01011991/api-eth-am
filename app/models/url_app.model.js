module.exports = (sequelize, Sequelize) => {
const UrlApp = sequelize.define("url_apps", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        },
        url: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.INTEGER,
        },
    });
    return UrlApp;
}