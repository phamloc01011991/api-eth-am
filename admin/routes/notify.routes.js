const { authJwt } = require("../../admin/middleware");
const controller = require("../../admin/controllers/notify.controller")
 
module.exports = function (app){
    app.use(function (req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
      });

    //Create notify
    app.post("/api/admin/notify/create", [authJwt.verifyToken], controller.create)
    //Listing
    app.get("/api/admin/notify/listing", [authJwt.verifyToken], controller.listing)

  //Get notify for id
  app.post("/api/admin/notify/listing_for_id", [authJwt.verifyToken], controller.listing_for_id)

  //Update notify
  app.post("/api/admin/notify/update", [authJwt.verifyToken], controller.update)


  //Create notify for user
  app.post("/api/admin/notify/create_for_user", [authJwt.verifyToken], controller.create_for_user)
}