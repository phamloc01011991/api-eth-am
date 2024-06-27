const db = require("../models");
const config = require("../config/auth.config");
const Admin = db.admin;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  // Save User to Database
  console.log("Đăng ký admin đã zoo đây1");
  Admin.create({
    username: req.body.username,
    email: req.body.email,
    fullName: req.body.fullName,
    role: req.body.role,
    password: bcrypt.hashSync(req.body.password, 8),
  })
    .then((user) => {
      console.log("Đăng ký admin đã zoo đây2");
      var token = jwt.sign({ id: user.id }, config.secretAdmin, {
        expiresIn: 8640000,
      });
      const { password, ...userData } = user.toJSON();
      res.send({ success: true, accessToken: token, data: userData });
      // return{
      //   success: true,
      //   accessToken:token,
      //   data: userData
      // }
      // if (req.body.roles) {
      //   Role.findAll({
      //     where: {
      //       name: {
      //         [Op.or]: req.body.roles
      //       }
      //     }
      //   }).then(roles => {
      //     user.setRoles(roles).then(() => {
      //       res.send({ message: "User registered successfully!" });
      //     });
      //   });
      // } else {
      //   // user role = 1
      //   user.setRoles([1]).then(() => {
      //     res.send({ message: "User registered successfully!" });
      //   });
      // }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  Admin.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }
      var token = jwt.sign({ id: user.id }, config.secretAdmin, {
        expiresIn: 8640000,
      });

      res.status(200).send({
        userData: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        userAbilities: user.abilities, // khong co
        success: true,
        accessToken: token,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
