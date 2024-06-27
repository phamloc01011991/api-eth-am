const { authJwt } = require("../../admin/middleware");
const controller = require("../../admin/controllers/transaction_toup.controller");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post(
    "/api/admin/confirm_toup",
    [authJwt.verifyToken],
    controller.confirm_toup
  );
};
