const { authJwt } = require("../../app/middleware");
const controller = require("../../app/controllers/transaction_toup.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/user/topup-trans", controller.new_trans_topup);
};
