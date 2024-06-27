module.exports = (sequelize, Sequelize) => {
const Kyc = sequelize.define("kycs", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        },
        identity_card:{
            type: Sequelize.STRING
        },
        real_name:{
            type: Sequelize.STRING
        }, 
        user_id: {
            type: Sequelize.INTEGER,
        },
        frontImage: {
            type: Sequelize.STRING,
        },
        backImage: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        },
    }
);
 return Kyc;
}