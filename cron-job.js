const Bree = require("bree");
const Graceful = require("@ladjs/graceful");

const bree = new Bree({
  logger: false,
  jobs: [
    {
      name: "schedule-check-user",
      cron: "0 * * * *",
      timezone: "Asia/Ho_Chi_Minh",
    },
    {
      name: "schedule-add-mining",
      cron: "* * * * *",
      timezone: "Asia/Ho_Chi_Minh",
    },
  ],
});

bree.start();

const graceful = new Graceful({ brees: [bree] });
graceful.listen();
