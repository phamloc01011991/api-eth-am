const { authJwt } = require("../middleware");
const controller = require("../controllers/staking.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/staking", [authJwt.verifyToken], controller.listing);
  app.get("/api/staking/:id", [authJwt.verifyToken], controller.listing);
  app.post("/api/staking-user", [authJwt.verifyToken], controller.create);
  app.get(
    "/api/staking-user/history/:id",
    [authJwt.verifyToken],
    controller.userStackingHistory
  );
  app.put("/api/staking-user/:id", [authJwt.verifyToken], controller.update);
  app.put(
    "/api/staking-interest/:id",
    [authJwt.verifyToken],
    controller.takeInterestStaking
  );
};
