const db = require("../../app/models");
const TopupTransaction = db.transaction;
const User = db.user;
var jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const axios = require("axios");
const { generateRandomString } = require("../../helper/string");
const { ENUM_COIN, ENUM_TRANSACTION, ENUM_STATUS } = require("../../enum");

exports.new_trans_topup = async (req, res) => {
  try {
    const { amount, address } = req.body;
    const user = await User.findOne({ where: { address } });
    if (!user) throw new Error("INVALID_USER");

    // Tạo một giao dịch nạp tiền mới
    const transaction = await TopupTransaction.create({
      user_id: user?.id,
      amount: amount,
      source: ENUM_COIN.usdt,
      code: generateRandomString(),
      typeTransaction: ENUM_TRANSACTION.toup,
      status: ENUM_STATUS.pending,
    });

    // Tạo một giao dịch mới
    res.status(200).json({
      message: "Top-up transaction created successfully",
      transaction,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
