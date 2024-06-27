const { authJwt } = require("../../admin/middleware");
const controller = require("../../app/controllers/coin.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  //create coin
  app.post("/api/admin/coinList/create", [authJwt.verifyToken], controller.create);
  //listing coin
  app.get("/api/coinList/admin/listing", [authJwt.verifyToken], controller.listing)
};
