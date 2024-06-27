const dbUser = require("../../app/models");
const db = require("../../admin/models");

const WithdrawalTransaction = dbUser.transaction;
const sequelize = dbUser.sequelize;
const User = dbUser.user;
const NotifyForUser = dbUser.notify_for_user;
const Config = db.config;
exports.confirm_withdrawal_transaction = async (req, res) => {
  try {
    const { transactionId, status } = req.body;
    // Kiểm tra xem trạng thái có hợp lệ hay không
    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ message: "Invalid status" });
    }
    // Cập nhật trạng thái của giao dịch rút tiền
    const transaction = await WithdrawalTransaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    // Kiểm tra trạng thái hiện tại của giao dịch
    if (transaction.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Transaction status cannot be updated" });
    }
    // Cập nhật trạng thái của giao dịch rút tiền
    transaction.status = status;
    await transaction.save();

    // Lấy thông tin người dùng liên quan đến giao dịch rút tiền
    const user = await User.findByPk(transaction.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Nếu trạng thái là "rejected"
    if (status === "rejected") {
      // Cộng lại số tiền vào trường balance của người dùng
      // const configData = await Config.findAll({});
      // //Lấy tỷ giá VND/USD

      // const fee = configData[0].dataValues.withdrawal_fee;
      // const amountAfterFee =
      //   parseFloat(transaction.amount) +
      //   (parseFloat(transaction.amount) * fee) / 100;
      const balanceNow =
        parseFloat(user.balance_usdt) + parseFloat(transaction.amount);
      await User.update(
        { balance_usdt: balanceNow },
        { where: { id: user.id } }
      );
      // Cập nhật trường balanceNow trong bảng WithdrawalTransaction

      const notifyData = {
        user_id: user.id,
        title: `Lệnh rút USD đã bị từ chối`,
        titleEnglish: "USD withdrawal order failed",
        content: `Lệnh rút ${transaction.amount}$ của bạn đã bị từ chối.`,
        contentEnglish: `Your withdrawal request for ${transaction.amount}$ has been declined.`,
      };
      await NotifyForUser.create(notifyData);

      return res
        .status(200)
        .json({ message: "Withdrawal transaction rejected" });
    }
    // Nếu trạng thái là "approved"
    else if (status === "approved") {
      // Tạo thông báo trong bảng notify_for_user
      const notifyData = {
        user_id: user.id,
        title: "Lệnh rút USD thành công",
        titleEnglish: "USD withdrawal order successful",
        content: `Lệnh rút ${transaction.amount}$ đã được duyệt và chuyển vào tài khoản thụ hưởng của bạn.`,
        contentEnglish: `The withdrawal order ${transaction.amount}$ has been approved and transferred to your beneficiary account.`,
      };
      await NotifyForUser.create(notifyData);
      // Cập nhật trạng thái và thông báo thành công
      res.status(200).json({ message: "Withdrawal transaction approved" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//listing coin
exports.list_withdrawal_transactions = async (req, res) => {
  try {
    const { fullName, transactionId, userId, page, limit, status } = req.query;

    const defaultLimit = 10;
    const defaultPage = 1;
    const parsedLimit = limit ? parseInt(limit) : defaultLimit;
    const parsedPage = page ? parseInt(page) : defaultPage;

    const query = `
        SELECT withdrawal_transactions.id AS transactionId, withdrawal_transactions.amount, 
          withdrawal_transactions.status, users.fullName, users.balance, 
          banks_for_users.nameUser, banks_for_users.numberCard, banks_for_users.bankName
        FROM withdrawal_transactions
        INNER JOIN users ON withdrawal_transactions.user_id = users.id
        INNER JOIN banks_for_users ON users.id = banks_for_users.user_id
        WHERE (:fullName IS NULL OR users.fullName LIKE :fullName)
          AND (:transactionId IS NULL OR withdrawal_transactions.id = :transactionId)
          AND (:userId IS NULL OR users.id = :userId)
          AND (:status IS NULL OR withdrawal_transactions.status = :status)
        LIMIT :limit OFFSET :offset;
      `;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM withdrawal_transactions
        INNER JOIN users ON withdrawal_transactions.user_id = users.id
        INNER JOIN banks_for_users ON users.id = banks_for_users.user_id
        WHERE (:fullName IS NULL OR users.fullName LIKE :fullName)
          AND (:transactionId IS NULL OR withdrawal_transactions.id = :transactionId)
          AND (:userId IS NULL OR users.id = :userId)
          AND (:status IS NULL OR withdrawal_transactions.status = :status);
      `;

    const transactions = await sequelize.query(query, {
      replacements: {
        fullName: fullName ? `%${fullName}%` : null,
        transactionId: transactionId ? parseInt(transactionId) : null,
        userId: userId ? parseInt(userId) : null,
        status: status ? status : null,
        limit: parsedLimit,
        offset: (parsedPage - 1) * parsedLimit,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    const countResult = await sequelize.query(countQuery, {
      replacements: {
        fullName: fullName ? `%${fullName}%` : null,
        transactionId: transactionId ? parseInt(transactionId) : null,
        status: status ? status : null,
        userId: userId ? parseInt(userId) : null,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    const total = countResult[0].total;

    res.status(200).json({ transactions, count: total });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
