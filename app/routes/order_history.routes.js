const { verifySignUp } = require("../../app/middleware");
const { authJwt } = require("../../app/middleware");
const controller = require("../../app/controllers/order_history.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/order_history/check_duplicate", controller.checkSpamOrder);
  app.post("/api/order_history/order", controller.order);
  app.get("/api/order_history/listing", controller.listing_order);
  app.get(
    "/api/order_history/transaction_result",
    controller.transaction_result
  );
};
