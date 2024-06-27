const { authJwt } = require("../../admin/middleware");
const controller = require("../../admin/controllers/staking.controller");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/admin/staking", [authJwt.verifyToken], controller.create);
  app.put("/api/admin/staking/:id", [authJwt.verifyToken], controller.update);
  app.delete(
    "/api/admin/staking/:id",
    [authJwt.verifyToken],
    controller.delete
  );
  app.get("/api/admin/staking", [authJwt.verifyToken], controller.listing);
};
