const { authJwt } = require("../middleware");
const controller = require("../controllers/config_interest.controller");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  //   create config interest
  app.post(
    "/api/admin/config-interest",
    [authJwt.verifyToken],
    controller.create
  );
  //   get config interest
  app.get(
    "/api/admin/config-interest",
    [authJwt.verifyToken],
    controller.listing
  );
  //   update config interest
  app.put(
    "/api/admin/config-interest/:id",
    [authJwt.verifyToken],
    controller.update
  );
  //   delete config interest
  app.delete(
    "/api/admin/config-interest/:id",
    [authJwt.verifyToken],
    controller.delete
  );
};
