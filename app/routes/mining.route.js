const { verifySignUp } = require("../middleware");
const controller = require("../controllers/mining.controller");
const { authJwt } = require("../middleware");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/mining/start", controller.startMining);
  app.post("/api/mining/stop", controller.stopMining);
};
