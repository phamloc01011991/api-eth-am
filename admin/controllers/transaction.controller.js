const db = require("../../app/models");
const config = require("../../admin/config/auth.config");
const User = db.user;
const Transaction = db.transaction;
const Op = db.Sequelize.Op;

const sequelize = db.sequelize;
const { QueryTypes } = require("sequelize");
exports.listingTransaction = async (req, res) => {
  try {
    const {
      limit,
      page,
      address,
      transactionId,
      userId,
      status,
      typeTransaction,
    } = req.query;

    const defaultLimit = 10;
    const defaultPage = 1;
    const parsedLimit = limit ? parseInt(limit) : defaultLimit;
    const parsedPage = page ? parseInt(page) : defaultPage;

    let query = `
        SELECT transactions.id AS transactionId, transactions.amount, transactions.note, transactions.typeTransaction, 
       transactions.status, transactions.createdAt , users.address, users.id AS user_id, users.balance_eth, users.balance_usdt, users.balance
        FROM transactions
        INNER JOIN users ON transactions.user_id = users.id
        WHERE (:address IS NULL OR users.address LIKE :address)
          AND (:transactionId IS NULL OR transactions.id = :transactionId) 
          AND (:userId IS NULL OR users.id = :userId)
          AND (:status IS NULL OR transactions.status = :status)
      `;

    if (typeTransaction) {
      query += ` AND transactions.typeTransaction = :typeTransaction`;
    }

    query += " ORDER BY transactions.createdAt DESC";
    query += ` LIMIT :limit OFFSET :offset`;

    let countQuery = `
        SELECT COUNT(*) AS total
        FROM transactions
        INNER JOIN users ON transactions.user_id = users.id
        WHERE (:address IS NULL OR users.address LIKE :address)
          AND (:transactionId IS NULL OR transactions.id = :transactionId)
          AND (:userId IS NULL OR users.id = :userId)
          AND (:status IS NULL OR transactions.status = :status)
      `;

    if (typeTransaction) {
      countQuery += ` AND transactions.typeTransaction = :typeTransaction`;
    }

    const transactions = await sequelize.query(query, {
      replacements: {
        address: address ? `%${address}%` : null,
        transactionId: transactionId ? parseInt(transactionId) : null,
        userId: userId ? parseInt(userId) : null,
        status: status ? status : null,
        typeTransaction: typeTransaction ? typeTransaction : null,
        limit: parsedLimit,
        offset: (parsedPage - 1) * parsedLimit,
      },
      type: QueryTypes.SELECT,
    });

    const countResult = await sequelize.query(countQuery, {
      replacements: {
        address: address ? `%${address}%` : null,
        transactionId: transactionId ? parseInt(transactionId) : null,
        status: status ? status : null,
        userId: userId ? parseInt(userId) : null,
        typeTransaction: typeTransaction ? typeTransaction : null,
      },
      type: QueryTypes.SELECT,
    });

    const total = countResult[0].total;

    res.status(200).json({ transactions, count: total });
  } catch (error) {
    console.log("Đã xảy ra lỗi ở controller transaction admin:", error);
    res.status(500).json({ message: error });
  }
};
