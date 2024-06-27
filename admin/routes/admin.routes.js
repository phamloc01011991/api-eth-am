const { authJwt } = require("../../admin/middleware");
const controller = require("../../admin/controllers/admin.controller");


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/admin/listingUserWithId",[authJwt.verifyToken] ,controller.listingUserWithId)
  app.get("/api/admin/listingUser",[authJwt.verifyToken] ,controller.listingUser)
  app.post("/api/admin/newBank",[authJwt.verifyToken] ,controller.create_bank)
  // app.post("/api/admin/verifyAccount",[authJwt.verifyToken] ,controller.verifyAccount)
  app.post("/api/admin/newUrl",[authJwt.verifyToken] ,controller.create_url)
  app.post("/api/admin/updateUrl",[authJwt.verifyToken] ,controller.update_url)
  app.post("/api/admin/verifyAccount",[authJwt.verifyToken] ,controller.verifyAccount)
  app.get("/api/listingKyc",[authJwt.verifyToken] ,controller.kycListing)
  app.post("/api/admin/updateUser",[authJwt.verifyToken] ,controller.updateUser)
  app.get("/api/admin/statisticsOverview", [authJwt.verifyToken], controller.statistics_overview)
  app.get("/api/admin/get_setup", [authJwt.verifyToken], controller.get_setup)
  app.post("/api/admin/update_setup", [authJwt.verifyToken], controller.update_setup)
  app.post("/api/admin/delete_bank_for_user", [authJwt.verifyToken], controller.delete_bank_for_user)
  app.post("/api/admin/reward_and_punishment", [authJwt.verifyToken], controller.reward_and_punishment)
  app.post("/api/admin/disable_user", [authJwt.verifyToken], controller.disable_user)
  app.post("/api/admin/un_disable_user", [authJwt.verifyToken], controller.un_disable_user)
  app.get("/api/admin/get_users_disble", [authJwt.verifyToken], controller.get_users_disble)

};
