module.exports = (sequelize, Sequelize) => {
const BankAdmin = sequelize.define("bank_admin",
{
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bank_name:{
        type: Sequelize.STRING
    },
    user_id:{
        type: Sequelize.INTEGER
    },
    bank_account_name:{
        type: Sequelize.STRING
    },
    bank_account_number:{
        type: Sequelize.STRING
    },
    bank_account_branch:{
        type: Sequelize.STRING,
        optional: true
    },
})
return BankAdmin;
};