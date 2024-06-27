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

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.coin = require("../models/coin.model.js")(sequelize, Sequelize);
db.crypto = require("../models/crypto.model.js")(sequelize, Sequelize);
db.mining = require("../models/mining.model.js")(sequelize, Sequelize);
db.blog = require("../models/blog.model.js")(sequelize, Sequelize);
db.order_history = require("../models/order_history.model.js")(
  sequelize,
  Sequelize
);

db.banks_for_users = require("../models/banks_for_users.model.js")(
  sequelize,
  Sequelize
);
db.kyc = require("../models/kyc.model.js")(sequelize, Sequelize);
db.url_app = require("../models/url_app.model.js")(sequelize, Sequelize);
db.transaction = require("../models/transaction.model.js")(
  sequelize,
  Sequelize
);
db.notify_global = require("../models/notify_global.model.js")(
  sequelize,
  Sequelize
);
db.notify_for_user = require("../models/notify_for_user.model.js")(
  sequelize,
  Sequelize
);

db.history_interest = require("../models/history_interest.model.js")(
  sequelize,
  Sequelize
);
db.staking_user = require("../models/staking_user.model.js")(
  sequelize,
  Sequelize
);
db.staking = require("../models/staking.model.js")(sequelize, Sequelize);
db.staking_interest = require("../models/staking_interest.model.js")(
  sequelize,
  Sequelize
);
db.tracking_balance = require("../models/tracking_balance.model.js")(
  sequelize,
  Sequelize
);

// //connect order_history to user
// db.user.hasMany(db.order_history, {foreignKey: 'user_id', sourceKey: 'id'});
// db.order_history.belongsTo(db.user, {foreignKey: 'user_id', targetKey: 'id'});

// //connect transaction_topup to coin
// db.transaction_topup.belongsTo(db.user, {
//   foreignKey: 'user_id',
//   targetKey: 'id'
// });

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
