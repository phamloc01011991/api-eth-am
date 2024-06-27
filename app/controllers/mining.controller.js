const db = require("../models");
const dbAdmin = require("../../admin/models");
const WithdrawalTransaction = db.transaction;
const User = db.user;
const Crypto = db.crypto;
const Mining = db.mining;
const Config = dbAdmin.config;
const config = require("../config/auth.config");
const ConfigInterest = dbAdmin.config_interest;
const jwt = require("jsonwebtoken");
const { ENUM_COIN } = require("../../enum");
function findMax(arr) {
  if (arr.length === 0) {
    return null; // Hoặc "Mảng rỗng"
  }

  let max = arr[0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }

  return max;
}
const getLevel = (allLevels, balance) => {
  for (const level of allLevels) {
    if (balance >= level.minVal && balance < level.maxVal) {
      return level;
    }
  }
  const valueMax = findMax(allLevels?.map((item) => item.maxVal));
  if (balance >= valueMax)
    return allLevels?.find((item) => item.maxVal === valueMax);
  return null; // Trường hợp không thuộc bất kỳ level nào
};
exports.startMining = async (req, res) => {
  try {
    const { address } = req.body;
    const data = await User.findOne({
      where: { address },
    });

    if (!data) {
      throw new Error("INVALID_USER");
    }
    const dataConfig = await ConfigInterest.findAll();
    const valConfig = dataConfig?.map((item) => ({
      minVal: parseFloat(item?.valueMin),
      maxVal: parseFloat(item?.valueMax),
      minPer: parseFloat(item?.percentMin),
      maxPer: parseFloat(item?.percentMax),
      level: item?.level,
    }));
    const currentBalance = parseFloat(data?.balance_usdt);

    const findLevel = getLevel(valConfig, currentBalance);
    if (findLevel) {
      data.isMining = true;
      // // Cập nhật lastMiningTime của user
      data.lastMiningTime = new Date();
      await data.save();
    } else throw new Error("Not Enough Balance");
    res.status(200).json({
      success: true,
      message: "Success",
      data,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.stopMining = async (req, res) => {
  try {
    const { address } = req.body;
    const data = await User.update(
      {
        isMining: false,
      },
      {
        where: {
          address,
        },
        returning: true,
      }
    );
    const [affectedCount, affectedRows] = data;
    if (affectedRows === 0) throw new Error("INVALID_USER");
    res.status(200).json({
      success: true,
      message: "Success",
      data,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.listCoin = async (req, res) => {
  try {
    const data = await Crypto.findAll();
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
