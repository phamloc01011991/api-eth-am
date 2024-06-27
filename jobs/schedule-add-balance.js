const dbUser = require("../app/models");
const HistoryInterest = dbUser.history_interest;
const User = dbUser.user;
const fs = require("fs");
const path = require("path");
const { parentPort } = require("worker_threads");

const Cabin = require("cabin");
const Axe = require("axe");
const { Signale } = require("signale");

// initialize cabin
const logger = new Axe({
  logger: new Signale(),
});
const cabin = new Cabin({ logger });

// store boolean if the job is cancelled
let isCancelled = false;

// handle cancellation (this is a very simple example)
if (parentPort)
  parentPort.once("message", (message) => {
    if (message === "cancel") isCancelled = true;
  });

// load the queue
const queueFile = path.join(__dirname, "..", "queue.json");
if (!fs.existsSync(queueFile)) {
  cabin.info(`queue file does not exist yet: ${queueFile}`);
  // signal to parent that the job is done
  if (parentPort) parentPort.postMessage("done");
  else process.exit(0);
}
const removeObjectFromQueue = async (queue, index) => {
  const updatedQueue = queue.filter((item) => item.index !== `${index}`);
  return updatedQueue;
};
(async () => {
  try {
    let queue = require(queueFile);
    await Promise.all(
      queue.map(async (result, index) => {
        // if we've already cancelled this job then return early
        // if (isCancelled) return;
        // change balance
        try {
          await User.findByPk(result.user_id)
            .then(async (record) => {
              // If a record is found, it will be available in the 'record' variable
              if (record) {
                const { balance: previousBalance } = record.toJSON();
                await User.update(
                  {
                    balance:
                      parseFloat(previousBalance) +
                      parseFloat(result.additional_fee),
                  },
                  { where: { id: result.user_id } }
                );

                // send the create noty
                await HistoryInterest.create({
                  user_id: result.user_id,
                  additional_fee: parseFloat(result.additional_fee),
                  percent_interest: parseFloat(result.percent_interest),
                  balance_after: parseFloat(result.balance_after),
                });
                // flush the queue of this message
                queue = await removeObjectFromQueue(queue, index);
              } else {
                cabin.log("Record not found");
              }
            })
            .catch((error) => {
              cabin.error(error);
            });
        } catch (err) {
          cabin.error(err);
        }
      })
    );
    await fs.promises.writeFile(queueFile, JSON.stringify(queue));
  } catch (error) {
    cabin.error(error);
  }

  // signal to parent that the job is done
  if (parentPort) parentPort.postMessage("done");
  else process.exit(0);
})();
