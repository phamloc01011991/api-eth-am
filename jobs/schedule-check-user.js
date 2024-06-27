const dbUser = require("../app/models");
const Crypto = dbUser.crypto;
const Op = dbUser.Sequelize.Op;
const Cabin = require("cabin");
const Axe = require("axe");
const axios = require("axios");
const { Signale } = require("signale");

// initialize cabin
const logger = new Axe({
  logger: new Signale(),
});
const cabin = new Cabin({ logger });

(async () => {
  try {
    let result = [];
    const response = await axios({
      method: "get",
      url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
      headers: { ["x-cg-demo-api-key"]: "CG-MKhNX4WLMFMVKKfPnxHfFWak" },
    });
    const data = response?.data?.map((item) => {
      const coin_id = item?.id;
      delete item["id"];
      return {
        ...item,
        coin_id,
        roi: null,
      };
    });

    console.log(
      "🚀 ~ error:",
      data?.map((item) => item.coin_id)
    );
    for (const userData of data) {
      // console.log("🚀 ~ userData:", userData);
      const [user, created] = await Crypto.upsert(userData);
      // console.log(created ? "User created" : "User updated");
    }
  } catch (error) {
    console.log("🚀 ~ error:", error);
    // cabin.error(error);
  }
})();
