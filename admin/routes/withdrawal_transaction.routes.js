const { authJwt } = require("../../admin/middleware");
const controller = require("../../admin/controllers/withdrawal_transaction.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
    app.post("/api/admin/confirm_withdrawal", [authJwt.verifyToken], controller.confirm_withdrawal_transaction);
    app.get("/api/admin/list_withdrawal_transactions", [authJwt.verifyToken], controller.list_withdrawal_transactions);
}