const config = require("../config/db.config.js");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  operatorsAliases: Op,

  port: config.PORT,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.admin = require("./admin.model.js")(sequelize, Sequelize);
db.bank = require("./bankAdmin.model.js")(sequelize, Sequelize);
db.setup = require("./setup.model.js")(sequelize, Sequelize);
db.config = require("./config.model.js")(sequelize, Sequelize);
db.member = require("./member.model.js")(sequelize, Sequelize);
db.typing = require("./typing.model.js")(sequelize, Sequelize);
db.config_interest = require("./configInterest.model.js")(sequelize, Sequelize);

// db.role.belongsToMany(db.user, {
//   through: "user_roles",
//   foreignKey: "roleId",
//   otherKey: "userId"
// });
// db.user.belongsToMany(db.role, {
//   through: "user_roles",
//   foreignKey: "userId",
//   otherKey: "roleId"
// });

module.exports = db;
