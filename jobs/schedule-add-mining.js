const dbUser = require("../app/models");
const dbAdmin = require("../admin/models");
const Transaction = dbUser.transaction;
const User = dbUser.user;
const Mining = dbUser.mining;
const Crypto = dbUser.crypto;
const ConfigInterest = dbAdmin.config_interest;
const Config = dbAdmin.config;

const Cabin = require("cabin");
const Axe = require("axe");
const { Signale } = require("signale");
const { ENUM_COIN, ENUM_STATUS, ENUM_TRANSACTION } = require("../enum");
const { generateRandomString } = require("../helper/string");
const BATCH_SIZE = 100;
// initialize cabin
const logger = new Axe({
  logger: new Signale(),
});
const cabin = new Cabin({ logger });
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
async function processBatch(records, dataConfig, dataCrypto, hourMining = 4) {
  for (const record of records) {
    const currentBalance = parseFloat(record?.balance_usdt);
    if (record.lastMiningTime) {
      const currentTime = new Date();

      // Tạo một entry mới trong bảng Reward

      const valConfig = dataConfig?.map((item) => ({
        minVal: parseFloat(item?.valueMin),
        maxVal: parseFloat(item?.valueMax),
        minPer: parseFloat(item?.percentMin),
        maxPer: parseFloat(item?.percentMax),
        level: item?.level,
      }));
      const findLevel = getLevel(valConfig, currentBalance);
      if (findLevel) {
        const minBalance = findLevel?.minVal;
        const maxBalance = findLevel?.maxVal;
        const minReward = findLevel?.minPer / 100;
        const maxReward = findLevel?.maxPer / 100;

        // Công thức tính tỷ lệ tuyến tính
        const percentMining =
          minReward +
          (maxReward - minReward) *
            ((currentBalance - minBalance) / (maxBalance - minBalance));
        const rewardMining = currentBalance * percentMining;

        const ethPriceInUSD = dataCrypto.current_price;

        // Tính số lượng ETH tương ứng với số lượng USDT
        const ethAmount = rewardMining / parseFloat(ethPriceInUSD);
        const elapsedHours = Math.floor(
          (currentTime - new Date(record.lastMiningTime)) / (1000 * 60 * 60)
        );
        const reward = Math.floor(elapsedHours / hourMining);
        if (reward > 0) {
          await Mining.create({
            type: ENUM_COIN.eth,
            user_id: record?.id,
            amount_current: record.balance_usdt,
            amount_take: reward * ethAmount,
          });
          await Transaction.create({
            user_id: record?.id,
            amount: reward * ethAmount,
            source: ENUM_COIN.eth,
            code: generateRandomString(),
            typeTransaction: ENUM_TRANSACTION.mining,
            status: ENUM_STATUS.approved,
          });
          const currentBalanceEth = parseFloat(record?.balance_eth);
          record.balance_eth = currentBalanceEth + reward * ethAmount;
          // // Cập nhật lastMiningTime của user
          record.lastMiningTime = currentTime;
          await record.save();
        }
      } else {
        record.isMining = false;
        await record.save();
      }
    }
  }
}

async function updateRecordsInBatches(
  records,
  dataConfigInterest,
  dataCrypto,
  hourMining
) {
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await processBatch(batch, dataConfigInterest, dataCrypto, hourMining);
  }
}

(async () => {
  try {
    const allUser = await User.findAll({ where: { isMining: true } });

    const dataConfigInterest = await ConfigInterest.findAll();
    const { dataValues } = await Config.findOne({
      where: {
        id: 1,
      },
    });
    const dataCrypto = await Crypto.findOne({
      where: {
        coin_id: "ethereum",
      },
    });
    await updateRecordsInBatches(
      allUser,
      dataConfigInterest,
      dataCrypto,
      dataValues?.hour_mining
    );
  } catch (error) {
    console.log("🚀 ~ error:", error);
    cabin.error(error);
  }
})();
