module.exports = (sequelize, Sequelize) => {
    const BanksForUsers = sequelize.define("banks_for_users", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            },
            numberCard: {
                type: Sequelize.STRING,
            },
            bankName: {
                type: Sequelize.STRING,
            },
            branchName: {
                type: Sequelize.STRING,
                optional: true,
                defaultValue: ''
            },
            nameUser: {
                type: Sequelize.STRING,
            },
            user_id: {
                type: Sequelize.INTEGER,
            },

    });
    return BanksForUsers;
}