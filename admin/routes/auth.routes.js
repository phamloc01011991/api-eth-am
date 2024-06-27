const { verifySignUp } = require("../../admin/middleware");
const controller = require("../../admin/controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/admin/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
    ],
    controller.signup
  );

  app.post("/api/admin/auth/signin", controller.signin);

};

