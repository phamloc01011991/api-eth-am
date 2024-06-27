const { authJwt } = require("../middleware");
const controller = require("../controllers/blog.controller");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/admin/blog", [authJwt.verifyToken], controller.create);
  app.put("/api/admin/blog/:id", [authJwt.verifyToken], controller.update);
  app.delete("/api/admin/blog/:id", [authJwt.verifyToken], controller.delete);
  app.get("/api/admin/blog", [authJwt.verifyToken], controller.listing);
  app.get("/api/admin/blog/:id", [authJwt.verifyToken], controller.detail);
};
