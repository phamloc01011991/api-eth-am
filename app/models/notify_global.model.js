module.exports = (sequelize, Sequelize) =>{
    const notify_global = sequelize.define("notify_global",{

        title:{
            type: Sequelize.STRING
        },
        content:{
            type: Sequelize.TEXT,        },
        status:{
            type: Sequelize.INTEGER,
            deffaultValue: 0
        }

    })
    return notify_global;
}