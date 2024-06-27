const dbUser = require("../app/models");
const Order = dbUser.order_history;
const Transaction = dbUser.transaction;
const HistoryInterest = dbUser.history_interest;
const TrackingBalance = dbUser.tracking_balance;
const User = dbUser.user;
const sequelize = dbUser.sequelize;
const Op = dbUser.Sequelize.Op;
const Cabin = require("cabin");
const Axe = require("axe");
const { Signale } = require("signale");

// initialize cabin
const logger = new Axe({
  logger: new Signale(),
});
const cabin = new Cabin({ logger });
function processArray(array) {
  const result = {};

  // Lặp qua mỗi đối tượng trong mảng
  array.forEach((item) => {
    // Lấy user_id và price từ đối tượng
    const { user_id, price, type } = item;

    // Chuyển đổi price thành số
    const priceValue = parseFloat(price);

    // Kiểm tra xem user_id đã tồn tại trong kết quả chưa
    if (result.hasOwnProperty(user_id)) {
      // Nếu đã tồn tại, cập nhật giá tiền theo loại
      if (type === "win") {
        result[user_id] += priceValue;
      } else if (type === "lose") {
        result[user_id] -= priceValue;
      }
    } else {
      // Nếu chưa tồn tại, thêm user_id vào kết quả và cập nhật giá tiền theo loại
      if (type === "win") {
        result[user_id] = priceValue;
      } else if (type === "lose") {
        result[user_id] = -priceValue;
      }
    }
  });

  // Chuyển đổi kết quả từ đối tượng sang mảng
  const finalResult = [];
  for (const user_id in result) {
    finalResult.push({ user_id: parseInt(user_id), price: result[user_id] });
  }

  return finalResult;
}
(async () => {
  try {
    let result = [];
    const allUsers = await User.findAll({
      attributes: ["id"],
    });
    const currentDate = new Date();
    const oneDaysAgo = new Date(currentDate);
    oneDaysAgo.setDate(oneDaysAgo.getDate() - 1);

    for (const iteratorUser of allUsers) {
      result.push({
        user_id: iteratorUser.id,
        price: 0,
        type: "win",
      });

      //Thêm thời gian bắt đầu thống kê

      const orderHistory = await Order.findAll({
        where: {
          createdAt: {
            [Op.gte]: oneDaysAgo,
            [Op.lt]: currentDate,
          },
          user_id: iteratorUser.id,
        },
      });
      for (const iteratorHistory of orderHistory) {
        result.push({
          user_id: iteratorUser.id,
          price: iteratorHistory.profit,
          type: iteratorHistory.order_result,
        });
      }
      const interestHistory = await HistoryInterest.findAll({
        where: {
          createdAt: {
            [Op.gte]: oneDaysAgo,
            [Op.lt]: currentDate,
          },
          user_id: iteratorUser.id,
        },
      });
      for (const iteratorInterestHistory of interestHistory) {
        result.push({
          user_id: iteratorUser.id,
          price: iteratorInterestHistory.additional_fee,
          type: "win",
        });
      }

      let stakingsQuery = ` SELECT
        s.*,
        su.user_id
      FROM
      staking_interests s
      LEFT JOIN
      staking_users su ON s.staking_user_id = su.id
      WHERE s.createdAt >= :oneDaysAgo
      AND s.createdAt < :currentDate
      AND s.is_taked = true
      AND su.user_id = ${iteratorUser.id}
    `;

      const [data, _] = await sequelize.query(stakingsQuery, {
        replacements: { oneDaysAgo, currentDate },
      });

      for (const iteratorStaking of data) {
        result.push({
          user_id: iteratorUser.id,
          price: iteratorStaking.balance_interest,
          type: "win",
        });
      }
    }

    const dataCreated = processArray(result);
    await TrackingBalance.bulkCreate(dataCreated);
  } catch (error) {
    cabin.error(error);
  }
})();
