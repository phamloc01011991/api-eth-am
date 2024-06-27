const db = require("../models");
// const ROLES = db.ROLES;
const Admin = db.admin;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  Admin.findOne({
    where: {
      username: req.body.username
    }
  }).then(user => {
    if (user) {
      res.status(400).send({
        message: "Failed! Username is already in use!"
      });
      return;
    }

    // Email
    Admin.findOne({
      where: {
        email: req.body.email
      }
    }).then(user => {
      if (user) {
        res.status(400).send({
          message: "Failed! Email is already in use!"
        });
        return;
      }

      next();
    });
  });
};

// checkRolesExisted = (req, res, next) => {
//   if (req.body.roles) {
   

//       if (!ROLES.indexOf(req.body.roles) !== -1) {
//         res.status(400).send({
//           message: "Failed! Role Invalid"
//         });
//         return;
//       }
    
//   }
  
//   next();
// };

const verifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail
};

module.exports = verifySignUp;
