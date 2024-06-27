require("dotenv").config();
module.exports = {
  HOST: process.env.HOST_DB,
  USER: process.env.USER_DB,
  PORT: process.env.PORT_DB,
  PASSWORD: process.env.PASSWORD_DB,
  DB: process.env.DB,
  dialect: "mysql",
  pool: {
    max: 400,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
