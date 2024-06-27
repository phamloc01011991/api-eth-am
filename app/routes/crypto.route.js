const { verifySignUp } = require("../middleware");
const controller = require("../controllers/crypto.controller");
const { authJwt } = require("../middleware");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/crypto", controller.listCoin);
  app.get("/api/crypto/:slug", controller.detailCoin);
  app.put("/api/crypto-convert", controller.convertCoin);
};
