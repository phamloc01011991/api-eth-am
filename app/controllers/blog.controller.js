const db = require("../models");
const Blog = db.blog;
const NotifyForUser = db.notify_for_user;
var jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const Op = db.Sequelize.Op;
exports.listing = async (req, res) => {
  try {
    const { page = 1, limit = 5, language } = req.query;
    const limitValue = parseInt(limit, 10);
    const offset = (page - 1) * limit;
    const result = await Blog.findAll({
      order: [["id", "DESC"]],
      attributes: { exclude: ["description"] },
      where: { actived: true },
      limit: limitValue,
      offset,
    });
    let listing;
    if (language === "EN") {
      listing = result?.map((item) => ({
        ...item.dataValues,
        description: item.descriptionEnglish,
        title: item.titleEnglish,
      }));
    } else {
      listing = result?.map((item) => ({ ...item.dataValues }));
    }
    res.status(200).send({
      message: "Listing notify success",
      success: true,
      data: listing,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const data = await Blog.findOne({
      where: {
        slug,
      },
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
  const { limit } = req.query;
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, config.secret);
  const userID = decodedToken.id;
  try {
    const data = await NotifyForUser.findAll({
      where: {
        user_id: userID,
      },
      order: [["id", "DESC"]],
      limit: parseInt(limit) || 5,
    });

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
