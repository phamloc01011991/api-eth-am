const { verifySignUp } = require("../../app/middleware");
const controller = require("../../admin/controllers/order_history.controller");
module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
  
    app.post("/api/admin/order_confirm", controller.confirm_order);
    app.get("/api/admin/listing", controller.listing_order);
  };
  