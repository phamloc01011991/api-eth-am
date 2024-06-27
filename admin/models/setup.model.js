module.exports = (sequelize, Sequelize) => {
    const setup = sequelize.define("setup", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type: {
            type: Sequelize.STRING
        },
        value: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING,
            optional: true
        },
    });
    return setup;
}