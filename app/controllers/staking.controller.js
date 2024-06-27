const db = require("../models");
const dbAdmin = require("../../admin/models");
const StakingUser = db.staking_user;
const User = db.user;
const TopupTransaction = db.transaction;
const Staking = db.staking;
const StakingInterest = db.staking_interest;
const Config = dbAdmin.config;
const sequelize = db.sequelize;
var jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const { generateRandomString } = require("../../helper/string");
const Op = db.Sequelize.Op;
exports.create = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, config.secret);
    const userID = decodedToken.id;
    const { staking_id, balance_hold } = req.body;
    if (staking_id) {
      const findExistStaking = await StakingUser.findAll({
        where: { [Op.and]: [{ staking_id }, { user_id: userID }] },
      });
      if (findExistStaking?.length) throw new Error("Exist");

      const userInfo = await User.findByPk(userID);
      if (parseFloat(userInfo.balance) < parseFloat(balance_hold))
        throw new Error("Not enough balance");
      const currentDate = new Date();
      const futureDate = new Date(currentDate);
      const stakingInfo = await Staking.findOne({ where: { id: staking_id } });
      futureDate.setDate(currentDate.getDate() + stakingInfo.dateHold);
      await StakingUser.create({
        user_id: userID,
        staking_id,
        balance_hold,
        date_end: futureDate,
      });
      userInfo.balance =
        parseFloat(userInfo.balance) - parseFloat(balance_hold);

      // Lấy giá trị balance hiện tại của người dùng sau khi cộng thêm
      const updatedUser = await userInfo.save();
      const balanceNow = updatedUser.balance;
      const data = await TopupTransaction.create({
        user_id: userID,
        amount: 0,
        typeTransaction: "withdrawal",
        type: "staking",
        amount_usd: balance_hold,
        balanceNow,
        status: "approved",
        code: generateRandomString(),
      });
      res.json({ success: true, data: { ...data.dataValues, staking_id } });
    } else {
      throw new Error("Error");
    }
  } catch (error) {
    console.log("🚀 ~ exports.create= ~ error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.listing = async (req, res) => {
  try {
    const id = req.params.id;
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, config.secret);
    const userID = decodedToken.id;
    let stakingsQuery = ` SELECT
          s.*,
          su.balance_hold,
          su.date_end,
          su.balance_take,
          su.id as id_staking_user,
          si.balance_interest
        FROM
        stakings s
        LEFT JOIN
        staking_users su ON s.id = su.staking_id AND su.user_id = ${userID}
        LEFT JOIN
        staking_interests si ON su.id = si.staking_user_id AND si.is_taked = false
    `;

    const [data, _] = await sequelize.query(stakingsQuery);

    const balanceInterestMap = new Map();

    for (const item of data) {
      const id = item.id;
      const balanceInterest = parseFloat(item.balance_interest || 0);

      // Nếu id đã tồn tại trong Map, cộng giá trị balance_interest vào giá trị hiện tại
      if (balanceInterestMap.has(id)) {
        const currentBalanceInterest = balanceInterestMap.get(id);
        balanceInterestMap.set(id, currentBalanceInterest + balanceInterest);
      } else {
        // Nếu id chưa tồn tại, thêm giá trị balance_interest vào Map
        balanceInterestMap.set(id, balanceInterest);
      }
    }

    // Xóa dữ liệu ban đầu và tạo lại mảng kết quả
    const result = [];

    for (const item of data) {
      const id = item.id;
      if (balanceInterestMap.has(id)) {
        const balanceInterest = balanceInterestMap.get(id);
        result.push({
          ...item,
          balance_interest: balanceInterest,
          ...(!item.balance_hold
            ? { balance_hold: 0 }
            : { balance_hold: parseFloat(item.balance_hold) }),
          ...(!item.balance_take
            ? { balance_take: 0 }
            : { balance_take: parseFloat(item.balance_take) }),
        });
        balanceInterestMap.delete(id);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...(id
          ? { result: result.find((item) => item.id === parseInt(id)) }
          : {
              result,
              balance_hold_total: calculateTotalByKey(result, "balance_hold"),
            }),
      },
      //   count,
      //   sum,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.userStackingHistory = async (req, res) => {
  try {
    const id = req.params.id;
    const defaultLimit = 10;
    const limit = req.query.limit ? parseInt(req.query.limit) : defaultLimit;
    const historyStacking = await StakingInterest.findAll({
      where: { staking_user_id: id },
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: historyStacking,
      //   count,
      //   sum,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { type, price } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, config.secret);
    const userID = decodedToken.id;

    const stakingUserInfo = await StakingUser.findOne({ where: { id } });
    if (!stakingUserInfo) throw new Error("Not exist");
    const currentDate = new Date();
    let balanceNow, dataTransaction;
    if (!price) throw new Error("Enter price");
    let currentPrice = parseFloat(price);
    // Rut tien tu staking
    const userInfo = await User.findByPk(userID);
    if (type === "withdrawal") {
      if (currentPrice > parseFloat(stakingUserInfo.balance_hold))
        throw new Error("Not Enough");

      stakingUserInfo.balance_hold =
        parseFloat(stakingUserInfo.balance_hold) - currentPrice;
      const updatedStakingUserInfo = await stakingUserInfo.save();
      const balanceStakingUserInfoNow = updatedStakingUserInfo.balance_hold;

      // check balance_hold = 0 then remove
      if (!balanceStakingUserInfoNow)
        await StakingUser.destroy({ where: { id } });

      // Check user withdraw before date end
      if (currentDate < stakingUserInfo.date_end) {
        const dataConfig = await Config.findAll({
          where: {
            id: 1,
          },
        });
        const percent = dataConfig[0].dataValues.percent_stacking_fee;
        let feeCharge = (currentPrice * parseFloat(percent)) / 100;
        currentPrice = currentPrice - feeCharge;
      }
      userInfo.balance = parseFloat(userInfo.balance) + currentPrice;
      const updatedUser = await userInfo.save();
      balanceNow = updatedUser.balance;
      dataTransaction = await TopupTransaction.create({
        user_id: userID,
        amount: 0,
        type: "staking",
        typeTransaction: "toup",
        amount_usd: currentPrice,
        balanceNow,
        status: "approved",
        code: generateRandomString(),
      });
      // nap tien vao staking
    } else if (type === "toup") {
      if (currentPrice > parseFloat(userInfo.balance))
        throw new Error("Balance Not Enough");

      stakingUserInfo.balance_hold =
        parseFloat(stakingUserInfo.balance_hold) + currentPrice;
      await stakingUserInfo.save();

      userInfo.balance = parseFloat(userInfo.balance) - currentPrice;
      const updatedUser = await userInfo.save();
      balanceNow = updatedUser.balance;
      dataTransaction = await TopupTransaction.create({
        user_id: userID,
        amount: 0,
        type: "staking",
        typeTransaction: "withdrawal",
        amount_usd: currentPrice,
        balanceNow,
        status: "approved",
        code: generateRandomString(),
      });
    } else throw new Error("Select type");

    res.json({
      success: true,
      data: {
        ...dataTransaction.dataValues,
        staking_id: stakingUserInfo.staking_id,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
function calculateTotalByKey(array, key) {
  // Khởi tạo biến tổng
  let total = 0;

  // Lặp qua mỗi đối tượng trong mảng
  for (const item of array) {
    // Kiểm tra xem đối tượng có key được chỉ định không
    if (item.hasOwnProperty(key)) {
      // Chuyển đổi giá trị key thành số và cộng vào tổng
      total += parseFloat(item[key] || 0);
    }
  }

  // Trả về tổng cuối cùng
  return total;
}
exports.takeInterestStaking = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, config.secret);
    const id = req.params.id;
    const userID = decodedToken.id;

    const findExistStaking = await StakingInterest.findAll({
      where: { [Op.and]: [{ staking_user_id: id }, { is_taked: false }] },
    });

    if (findExistStaking?.length) {
      const stakingUserInfo = await StakingUser.findByPk(id);
      const userInfo = await User.findByPk(userID);
      const balanceInterest = calculateTotalByKey(
        findExistStaking.map((item) => item.dataValues),
        "balance_interest"
      );
      userInfo.balance =
        parseFloat(userInfo.balance) + parseFloat(balanceInterest);

      // Lấy giá trị balance hiện tại của người dùng sau khi cộng thêm
      const updatedUser = await userInfo.save();
      const balanceNow = updatedUser.balance;
      await TopupTransaction.create({
        user_id: userID,
        amount: 0,
        type: "staking",
        typeTransaction: "toup",
        amount_usd: balanceInterest,
        balanceNow,
        status: "approved",
        code: generateRandomString(),
      });
      await StakingUser.update(
        {
          balance_take:
            parseFloat(stakingUserInfo.balance_take) +
            parseFloat(balanceInterest),
        },
        {
          where: { id },
        }
      );
      await StakingInterest.update(
        { is_taked: true },
        {
          where: { staking_user_id: id },
        }
      );

      res.json({ success: true });
    } else throw new Error("Not Exist");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// exports.delete = async (req, res) => {
//   try {
//     const id = req.params.id;
//     await HistoryInterest.destroy({ where: { id } });

//     res.status(200).json({ success: true, message: "Xoá bank thành công." });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
