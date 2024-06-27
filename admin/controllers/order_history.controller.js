const db = require("../../app/models");
const OrderHistory = db.order_history;
const User = db.user;
const sequelize = db.sequelize;
const Coin = db.coin;
var jwt = require("jsonwebtoken");
const config = require("../../admin/config/auth.config");
exports.confirm_order = async (req, res) => {
  try {
    const { orderId, orderResult } = req.body;

    // Kiểm tra orderId có tồn tại trong bảng order_history hay không
    const order = await OrderHistory.findOne({ where: { id: orderId } });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order does not exist" });
    }
    // Kiểm tra trạng thái order_result của orderId
    if (order.order_result === "pending") {
      let exitPrice = order.entry_price; // Giá trị mặc định là entry_price
      let negativeProfit = null; // Giá trị mặc định là 0
      if (orderResult === "win") {
        if (order.order_type === "long") {
          // Cập nhật exit_price là entry_price + random trong khoảng 2% đến 10%
          const randomPercentage = (Math.random() * (0.5 - 0.1) + 0.1) / 100;
          exitPrice = (
            parseFloat(order.entry_price) +
            parseFloat(order.entry_price) * randomPercentage
          ).toFixed(8);
        } else if (order.order_type === "short") {
          // Cập nhật exit_price là entry_price - random trong khoảng 2% đến 10%
          const randomPercentage = (Math.random() * (0.5 - 0.1) + 0.1) / 100;
          exitPrice = (
            parseFloat(order.entry_price) -
            parseFloat(order.entry_price) * randomPercentage
          ).toFixed(8);
        }
        const status = "win";
        const updateData = { status_time: status };
        await order.update(updateData);
      } else if (orderResult === "lose") {
        negativeProfit = parseFloat(order.profit) * -1;
        if (order.order_type === "long") {
          // Cập nhật exit_price là entry_price - random trong khoảng 2% đến 10%
          const randomPercentage = (Math.random() * (0.5 - 0.1) + 0.1) / 100;
          exitPrice = (
            parseFloat(order.entry_price) -
            parseFloat(order.entry_price) * randomPercentage
          ).toFixed(8);
        } else if (order.order_type === "short") {
          // Cập nhật exit_price là entry_price + random trong khoảng 2% đến 10%
          const randomPercentage = (Math.random() * (0.5 - 0.1) + 0.1) / 100;
          exitPrice = (
            parseFloat(order.entry_price) +
            parseFloat(order.entry_price) * randomPercentage
          ).toFixed(8);
        }
      }
      const updateData = { order_result: orderResult, exit_price: exitPrice };
      if (negativeProfit != null) {
        updateData.profit = negativeProfit;
      }
      await OrderHistory.update(updateData, { where: { id: orderId } });

      return res
        .status(200)
        .json({ success: true, message: "Order result has been updated" });
    } else {
      return res.status(200).json({
        success: false,
        message: "Order result has already been updated",
      });
    }
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
exports.listing_order = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, nameUser } = req.query;
    const offset = (page - 1) * limit;
    const limitValue = parseInt(limit, 10);

    let query = `
      SELECT OH.*, U.balance
      FROM order_histories AS OH
      INNER JOIN users AS U ON OH.user_id = U.id
    `;

    const replacements = {
      limit: limitValue,
      offset: offset,
    };

    if (userId) {
      query += ` WHERE OH.user_id = :userId`;
      replacements.userId = userId;
    }

    // if (nameUser) {
    //   if (userId) {
    //     query += ` AND U.fullName LIKE :nameUser`;
    //   } else {
    //     query += ` WHERE U.fullName LIKE :nameUser`;
    //   }
    //   replacements.nameUser = `%${nameUser}%`;
    // }

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM order_histories AS OH
      INNER JOIN users AS U ON OH.user_id = U.id
    `;

    if (userId) {
      countQuery += ` WHERE OH.user_id = :userId`;
    }

    // if (nameUser) {
    //   if (userId) {
    //     countQuery += ` AND U.fullName LIKE :nameUser`;
    //   } else {
    //     countQuery += ` WHERE U.fullName LIKE :nameUser`;
    //   }
    // }

    // Sắp xếp theo thời gian createdAt từ mới nhất đến cũ nhất
    query += ` ORDER BY OH.createdAt DESC`;

    const transactions = await sequelize.query(
      query + ` LIMIT :limit OFFSET :offset;`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const countResult = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const count = countResult[0].total;

    res.status(200).json({
      success: true,
      data: transactions,
      count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
