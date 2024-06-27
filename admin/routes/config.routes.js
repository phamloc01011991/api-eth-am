const { authJwt } = require("../../admin/middleware");
const controller = require("../../admin/controllers/config.controller");
module.exports = function (app){
    app.use(function (req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
      });
    //   create config
    app.post("/api/admin/config/create", [authJwt.verifyToken], controller.create);
    //   get config
    app.get("/api/admin/config/get_config", [authJwt.verifyToken], controller.get_config);
    //   update config
    app.post("/api/admin/config/update", [authJwt.verifyToken], controller.update);
    }