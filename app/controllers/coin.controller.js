const db = require("../models");
const Coin = db.coin;
const Op = db.Sequelize.Op;
const axios = require("axios");
exports.create = async (req, res) => {
  try {
    const { symbol, data } = req.body;

    const check = await Coin.findOne({ where: { symbol } });
    if (check) {
      throw new Error("COIN_ALREADY_EXITS");
    }
    const symbols = symbol.split(",");
    for (let i = 0; i < symbols.length; i++) {
      await Coin.create({
        symbol: symbols[i],
        data: data || {},
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// listing coin
exports.listing = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  try {
    const limitValue = parseInt(limit, 10);
    // const data = await Coin.findAll({
    //   offset,
    //   limit: limitValue,
    //   where: { ...(status ? { status } : {}) },
    // });
    const { count, rows: data } = await Coin.findAndCountAll({
      offset,
      limit: limitValue,
      where: { ...(status ? { status } : {}) },
    });
    const now = new Date();
    const options = { timeZone: "Europe/London" };
    const formattedNow = now.toLocaleString("sv", options);
    const endTime = formattedNow;
    const end = new Date(endTime);
    const dataObj = data[0].data;

    let startStr = "";
    if (dataObj && dataObj.time) {
      startStr = dataObj.time;
    }
    if (startStr === "") {
      startStr = "10:37:48"; // Giá trị mặc định nếu không tìm thấy giá trị "time"
    }
    const start = new Date(`${endTime.split(" ")[0]}T${startStr}`);
    const diffInMs = Math.abs(end.getTime() - start.getTime());
    const diffInSeconds = Math.floor(diffInMs / 1000);

    // console.log("diffInSeconds----", diffInSeconds);
    if (diffInSeconds > 30 || diffInSeconds < -30 || diffInSeconds == NaN) {
      try {
        axios
          .get("https://www.exchangerates.org.uk/forex-rates_update.php", {
            headers: {
              Referer:
                "https://www.exchangerates.org.uk/forex-tools/live-forex-rates.html",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
              "x-requested-with": "XMLHttpRequest",
            },
          })
          .then(async (rs) => {
            // console.log("🚀 ~ .then ~ rs:", rs);
            const allData = await Coin.findAll({});
            for (let i = 0; i < allData.length; i++) {
              const dataSymbol = allData[i].symbol;
              const id = allData[i].id;
              const infoSymbol = rs.data[dataSymbol];

              Coin.update(
                { data: infoSymbol },
                {
                  where: { id },
                }
              );
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    }

    res.status(200).json({
      success: true,
      data,
      count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Real time exchange
exports.threeProvider = async (req, res) => {
  try {
    const symbols = req.query.symbols.split(",");
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit <= 0) {
      limit = 10; // Giá trị mặc định nếu limit không hợp lệ
    }
    const data = await Coin.findAll({
      where: {
        symbol: {
          [Op.in]: symbols,
        },
      },
      limit: limit,
    });

    const now = new Date();
    const options = { timeZone: "Europe/London" };
    const formattedNow = now.toLocaleString("sv", options);
    const endTime = formattedNow;
    const end = new Date(endTime);
    const dataObj = data[0].data;

    let startStr = "";
    if (dataObj && dataObj.time) {
      startStr = dataObj.time;
    }
    if (startStr === "") {
      startStr = "10:37:48"; // Giá trị mặc định nếu không tìm thấy giá trị "time"
    }
    const start = new Date(`${endTime.split(" ")[0]}T${startStr}`);

    const diffInMs = Math.abs(end.getTime() - start.getTime());
    // console.log("diffInMs__________", diffInMs);
    const diffInSeconds = Math.floor(diffInMs / 1000);
    // console.log("diffInSeconds----", diffInSeconds);

    if (diffInSeconds > 30 || diffInSeconds < -30 || diffInSeconds == false) {
      try {
        const rs = await axios.get(
          "https://www.exchangerates.org.uk/forex-rates_update.php",
          {
            headers: {
              Referer:
                "https://www.exchangerates.org.uk/forex-tools/live-forex-rates.html",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
              "x-requested-with": "XMLHttpRequest",
            },
          }
        );
        // console.log("rs", rs);
        const allData = await Coin.findAll({});
        for (let i = 0; i < allData.length; i++) {
          const dataSymbol = allData[i].symbol;
          const id = allData[i].id;
          const infoSymbol = rs.data[dataSymbol];
          0;
          Coin.update(
            { data: infoSymbol },
            {
              where: { id },
            }
          );
        }
      } catch (error) {
        console.log(error);
      }
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
  }
};
