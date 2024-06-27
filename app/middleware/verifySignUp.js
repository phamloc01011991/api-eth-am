const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  if (req.body.email) {
    // email
    User.findOne({
      where: {
        email: req.body.email,
      },
    }).then((user) => {
      if (user) {
        return res.status(400).send({
          message: "Failed! Email is already in use!",
        });
      } else {
        next();
      }
    });
  } else if (req.body.phone) {
    // Phone
    User.findOne({
      where: {
        phone: req.body.phone,
      },
    }).then((user) => {
      console.log("🚀 ~ user:", user);
      if (user) {
        return res.status(400).send({
          message: "Failed! Phone is already in use!",
        });
      } else {
        next();
      }
    });
  }
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    if (!ROLES.indexOf(req.body.roles) !== -1) {
      res.status(400).send({
        message: "Failed! Role Invalid",
      });
      return;
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
  checkRolesExisted: checkRolesExisted,
};

module.exports = verifySignUp;
