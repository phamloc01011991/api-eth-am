const { authJwt } = require("../../app/middleware");
const controller = require("../../app/controllers/withdrawal_transaction.controller");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/user/withdrawal_trans", controller.new_withdrawal_transaction);
};
