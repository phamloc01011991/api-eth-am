const { authJwt } = require("../../app/middleware");
const controller = require("../../app/controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/api/user/getUser", controller.getInfo);
  app.put(
    "/api/user/update_user",
    [authJwt.verifyToken],
    controller.updateUser
  );
  app.post("/api/user/new_bank", [authJwt.verifyToken], controller.new_bank);
  app.get("/api/user/check_bank", [authJwt.verifyToken], controller.check_bank);
  app.post("/api/user/kyc", [authJwt.verifyToken], controller.kyc);
  app.get("/api/user/kycUser", [authJwt.verifyToken], controller.kycUser);
  app.get(
    "/api/user/get_bank_admin",
    [authJwt.verifyToken],
    controller.info_bank_admin
  );
  app.get(
    "/api/user/get_trans_history",
    [authJwt.verifyToken],
    controller.listing_transaction
  );
  app.get("/api/user/config/get_config", controller.get_config);
  app.get("/api/user/url", controller.get_url);
  app.get("/api/user/config-interest", controller.listing_config_interest);
  app.post("/api/user/forgot_password", controller.forget_password);
  app.get("/api/user/sum_total", controller.thongke);
  app.get("/api/user/list_referral", controller.listReferral);
  app.get("/api/user/list_transaction", controller.listTransaction);
  app.get("/api/user/list_user_transaction", controller.listTransaction);
};
