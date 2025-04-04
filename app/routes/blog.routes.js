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

  app.get("/api/blog", controller.listing);

  app.get("/api/blog/:slug", controller.detail);
};
