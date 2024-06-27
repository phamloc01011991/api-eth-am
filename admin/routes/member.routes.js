const { authJwt } = require("../middleware");
const controller = require("../controllers/member.controller");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/api/member", controller.listing);
  app.put("/api/member/:id", controller.update);
  app.post("/api/member", controller.create);
  app.get("/api/member-detail/:id", controller.detailMember);
  app.get("/api/member/detail", controller.detail);
  app.post("/api/typing", controller.createTyping);
  app.delete("/api/member/:id", controller.delete);
  // app.get("/api/admin/staking", [authJwt.verifyToken], controller.listing);
};
