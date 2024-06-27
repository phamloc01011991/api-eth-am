const db = require("../../app/models");
const dbAdmin = require("../../admin/models");
const WithdrawalTransaction = db.transaction;
const User = db.user;
const Bank = db.banks_for_users;
const Config = dbAdmin.config;
var jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const axios = require("axios");
const { generateRandomString } = require("../../helper/string");
const { ENUM_COIN, ENUM_TRANSACTION, ENUM_STATUS } = require("../../enum");
exports.new_withdrawal_transaction = async (req, res) => {
  try {
    let { amount, address } = req.body;
    const user = await User.findOne({ where: { address } });
    if (!user) throw new Error("INVALID_USER");

    const configData = await Config.findAll({});
    //Lấy tỷ giá VND/USD

    const fee = configData[0].dataValues.withdrawal_fee;
    const minWithdrawal = parseFloat(configData[0].dataValues.min_withdrawal);
    let amountWithdraw = parseFloat(amount);

    if (parseFloat(user.balance_usdt) < amountWithdraw) {
      res.status(200).json({ success: false, message: "Số dư không đủ" });
      return;
    }
    if (amountWithdraw < minWithdrawal) {
      res.status(200).json({
        success: false,
        message: `Bạn phải rút tối thiểu ${minWithdrawal} $`,
      });
      return;
    }

    // amountWithdraw = amountWithdraw + (amountWithdraw * fee) / 100;
    // Trừ số tiền từ trường balance của người dùng
    await User.decrement("balance_usdt", {
      by: amountWithdraw,
      where: { address },
    });

    const transaction = await WithdrawalTransaction.create({
      user_id: user?.id,
      source: ENUM_COIN.usdt,
      amount: parseFloat(amount),
      code: generateRandomString(),
      typeTransaction: ENUM_TRANSACTION.withdrawal,
      status: ENUM_STATUS.pending,
    });
    res.status(200).json({
      success: true,
      message: "Withdrawal transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);

    res.status(200).json({ message: error });
  }
};
