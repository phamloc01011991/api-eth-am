const db = require("../models");
const Notify = db.notify_global;
const NotifyForUser = db.notify_for_user;
var jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const Op = db.Sequelize.Op;
exports.listing = async (req, res) => {
  try {
    const listing = await Notify.findAll({
      order: [["id", "DESC"]],
      where: {
        [Op.or]: [{ status: null }, { status: 1 }],
      },
      limit: 3,
    });
    res.status(200).send({
      message: "Listing notify success",
      success: true,
      data: listing,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.listing_for_user = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, config.secret);
    const userID = decodedToken.id;
    const data = await NotifyForUser.findAll({
      where: {
        user_id: userID,
        [Op.or]: [{ status: null }, { status: 1 }],
      },
      order: [["id", "DESC"]],
      limit: 2,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.listing_full_user = async (req, res) => {
  const { limit, language } = req.query;
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, config.secret);
  const userID = decodedToken.id;
  try {
    const result = await NotifyForUser.findAll({
      where: {
        user_id: userID,
      },
      order: [["id", "DESC"]],
      limit: parseInt(limit) || 5,
    });
    let data;
    if (language === "EN") {
      data = result?.map((item) => ({
        ...item.dataValues,
        content: item.contentEnglish,
        title: item.titleEnglish,
      }));
    } else {
      data = result?.map((item) => ({ ...item.dataValues }));
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.viewed = async (req, res) => {
  try {
    const arrID = req.body.listID; //JSON.parse(req.body.listID)
    // if (!Array.isArray(arrID)) {
    //     throw new Error('listID is not an array');
    // }
    //req.body.listID [1,2]
    await Promise.all(
      arrID.map(async (item) => {
        await NotifyForUser.update(
          { status: 2 },
          {
            where: {
              id: item,
            },
          }
        );
      })
    );
    res.status(200).json({
      success: true,
      message: "Update thành công!!!",
    });
  } catch (error) {
    console.log(error);
  }
};
