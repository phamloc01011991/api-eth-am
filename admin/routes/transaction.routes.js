const { authJwt } = require("../../admin/middleware");
const controller = require("../../admin/controllers/transaction.controller");
module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
    app.get("/api/admin/listing_transactions", [authJwt.verifyToken], controller.listingTransaction)
}  