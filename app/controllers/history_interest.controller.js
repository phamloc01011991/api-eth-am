const db = require("../models");
const HistoryInterest = db.history_interest;
var jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
// exports.create = async (req, res) => {
//   try {
//     const { value, percent } = req.body;

//     const data = await HistoryInterest.create({
//       value,
//       percent,
//     });
//     res.json({ success: true, data });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
exports.listing = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, config.secret);
  const userID = decodedToken.id;
  const offset = (page - 1) * limit;

  try {
    const limitValue = parseInt(limit, 10);
    const sum = await HistoryInterest.sum("additional_fee", {
      where: {
        user_id: userID,
      },
    });
    const data = await HistoryInterest.findAll({
      offset,
      limit: limitValue,
      where: {
        user_id: userID,
      },
      order: [["id", "DESC"]],
    });

    const count = await HistoryInterest.count({
      where: {
        user_id: userID,
      },
    });

    res.status(200).json({
      success: true,
      data,
      count,
      sum,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// exports.update = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const { value, percent } = req.body;
//     const data = await HistoryInterest.update(
//       {
//         value,
//         percent,
//       },
//       {
//         where: {
//           id,
//         },
//       }
//     );
//     res.json({ success: true, data });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.delete = async (req, res) => {
//   try {
//     const id = req.params.id;
//     await HistoryInterest.destroy({ where: { id } });

//     res.status(200).json({ success: true, message: "Xoá bank thành công." });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
