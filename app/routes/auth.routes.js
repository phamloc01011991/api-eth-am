const { verifySignUp } = require("../../app/middleware");
const controller = require("../../app/controllers/auth.controller");
const { authJwt } = require("../../app/middleware");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [verifySignUp.checkDuplicateUsernameOrEmail],
    controller.signup
  );
  app.post("/api/connect-wallet", controller.connectWallet);
  app.post("/api/auth/signin", controller.signin);
  app.post(
    "/api/auth/changePassword",
    [authJwt.verifyToken],
    controller.changePassword
  );
};
