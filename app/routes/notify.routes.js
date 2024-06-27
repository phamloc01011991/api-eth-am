const { authJwt } = require("../../app/middleware");
const controller = require("../../app/controllers/notify.controller")
module.exports = function (app){
    app.use(function (req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
      });
      //listing notify
      app.get("/api/notify/listing", [authJwt.verifyToken], controller.listing)
      app.get("/api/notify/user", [authJwt.verifyToken], controller.listing_for_user)
      app.post("/api/notify/viewed", [authJwt.verifyToken], controller.viewed)
      app.get("/api/notify/listing_full_user", [authJwt.verifyToken], controller.listing_full_user)
}