const express = require("express");
const cors = require("cors");
const app = express();
const Bree = require("bree");
const Axe = require("axe");
const Cabin = require("cabin");
const Graceful = require("@ladjs/graceful");
const { Signale } = require("signale");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
// const socketIo = require("socket.io");

const queueFile = path.join(__dirname, "queue.json");
if (!fs.existsSync(queueFile)) fs.writeFileSync(queueFile, JSON.stringify([]));

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(helmet());
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const dbAdmin = require("./admin/models");
try {
  db.sequelize.sync();
  dbAdmin.admin.sequelize.sync();
} catch (error) {
  console.log(error);
}

// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome" });
});
// app.use("/file/android", express.static(__dirname + "/file/app.apk"));
// app.use("/file/ios", express.static(__dirname + "/file/app.ipa"));
// app.use("/file/plist", express.static(__dirname + "/file/app.plist"));
// routes app
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/coin.routes")(app);
require("./app/routes/crypto.route")(app);
require("./app/routes/mining.route")(app);
require("./app/routes/order_history.routes")(app);
require("./app/routes/transaction_toup.routes")(app);
require("./app/routes/withdrawal_transaction.routes")(app);
require("./app/routes/notify.routes")(app);
require("./app/routes/history_interest.routes")(app);
require("./app/routes/staking.routes")(app);
require("./app/routes/blog.routes")(app);

//routes admin
require("./admin/routes/transaction_toup.routes")(app);
require("./admin/routes/withdrawal_transaction.routes")(app);
require("./admin/routes/coin.routes")(app);
require("./admin/routes/admin.routes")(app);
require("./admin/routes/auth.routes")(app);
require("./admin/routes/order_history.routes")(app);
require("./admin/routes/transaction.routes")(app);
require("./admin/routes/notify.routes")(app);
require("./admin/routes/config.routes")(app);
require("./admin/routes/config_interest.routes")(app);
require("./admin/routes/staking.routes")(app);
require("./admin/routes/blog.routes")(app);
require("./admin/routes/member.routes")(app);
// set port, listen for requests
const logger = new Axe({
  logger: new Signale(),
});
const cabin = new Cabin({ logger });
app.use(cabin.middleware);

const PORT = 2202;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// let coinPrice = 100; // Giá trị coin khởi tạo

// // Hàm cập nhật giá trị coin ngẫu nhiên (chỉ để demo)
// function updateCoinPrice() {
//   coinPrice += (Math.random() - 0.5) * 2; // Tăng hoặc giảm ngẫu nhiên
//   io.emit("priceUpdate", coinPrice.toFixed(2)); // Gửi giá trị mới đến tất cả client
// }

// setInterval(updateCoinPrice, 1000); // Cập nhật mỗi giây

// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//   },
// });
// io.on("connection", (socket) => {
//   console.log("a user connected");
//   socket.emit("priceUpdate", coinPrice.toFixed(2)); // Gửi giá trị khởi tạo cho client

//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });
// });

// handle graceful reloads, pm2 support, and events like SIGHUP, SIGINT, etc.
const graceful = new Graceful({ servers: [server] });
graceful.listen();
