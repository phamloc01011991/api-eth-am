const db = require("../models");
const dbAdmin = require("../../admin/models");
const Transaction = db.transaction;
const User = db.user;
const Crypto = db.crypto;
const Config = dbAdmin.config;
const config = require("../config/auth.config");
const { ENUM_COIN, ENUM_TRANSACTION, ENUM_STATUS } = require("../../enum");
const { generateRandomString } = require("../../helper/string");

exports.listCoin = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const data = await Crypto.findAll({
      limit: parseInt(limit),
      order: [["id", "ASC"]],
    });
    res.status(200).json({
      success: true,
      message: "Success",
      data,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.detailCoin = async (req, res) => {
  try {
    const slug = req.params.slug;
    const data = await Crypto.findOne({
      where: {
        coin_id: slug,
      },
    });
    res.status(200).json({
      success: true,
      message: "Success",
      data,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.convertCoin = async (req, res) => {
  try {
    const { convertTo, address, amount } = req.body;
    const amountFloat = parseFloat(amount);
    const dataUser = await User.findOne({
      where: {
        address,
      },
    });
    if (!dataUser) throw new Error("INVALID_USER");
    if (convertTo === "eth" || convertTo === "usdt") {
      const dataCryptoTo = await Crypto.findOne({
        where: {
          symbol: "eth",
        },
      });
      const currentBalance = parseFloat(
        dataUser?.[`balance_${convertTo === "eth" ? "usdt" : "eth"}`]
      );

      if (amountFloat > currentBalance) throw new Error("Balance not enough");
      const priceInUSD = parseFloat(dataCryptoTo.current_price);

      if (convertTo === "eth") {
        const ethAmount = amountFloat / parseFloat(priceInUSD);
        dataUser.balance_usdt = currentBalance - amountFloat;
        dataUser.balance_eth = parseFloat(dataUser?.balance_eth) + ethAmount;
        await Transaction.create({
          user_id: dataUser?.id,
          amount: ethAmount,
          source: ENUM_COIN.usdt,
          target: ENUM_COIN.eth,
          code: generateRandomString(),
          typeTransaction: ENUM_TRANSACTION.transfer,
          status: ENUM_STATUS.approved,
          note: {
            current_price: dataCryptoTo.current_price,
            amount_target: ethAmount,
            amount_source: amountFloat,
          },
        });
      } else {
        const usdtAmount = amountFloat * parseFloat(priceInUSD);
        dataUser.balance_eth = currentBalance - amountFloat;
        dataUser.balance_usdt = parseFloat(dataUser?.balance_usdt) + usdtAmount;
        await Transaction.create({
          user_id: dataUser?.id,
          amount: usdtAmount,
          source: ENUM_COIN.eth,
          target: ENUM_COIN.usdt,
          code: generateRandomString(),
          typeTransaction: ENUM_TRANSACTION.transfer,
          status: ENUM_STATUS.approved,
          note: {
            current_price: dataCryptoTo.current_price,
            amount_target: usdtAmount,
            amount_source: amountFloat,
          },
        });
      }
      await dataUser.save();
      res.status(200).json({
        success: true,
        message: "Success",
        data: dataUser,
      });
    } else throw new Error("Coin Not Found");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
