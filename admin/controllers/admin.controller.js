const db = require("../../admin/models");
const config = require("../../admin/config/auth.config");
const dbUser = require("../../app/models");
const moment = require("moment");
const Bank = dbUser.banks_for_users;
const Admin = db.admin;
const User = dbUser.user;
const TopupTransaction = dbUser.transaction;

const UrlApp = dbUser.url_app;
const KYC = dbUser.kyc;
const Setup = db.setup;

const sequelize = dbUser.sequelize;
const { QueryTypes } = require("sequelize");
const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateRandomString } = require("../../helper/string");

exports.listingUserWithId = async (req, res) => {
  const defaultLimit = 10;
  const defaultPage = 1;
  let { page = 1, limit = 10, nameUser = "", id = "" } = req.query;
  console.log("___>>>>>>>>______", req.query);
  if (!limit) {
    limit = defaultLimit;
  }
  if (!page) {
    page = defaultPage;
  }

  const offset = (page - 1) * limit;
  const query = {};

  if (nameUser) {
    query.fullName = {
      [Op.like]: `%${nameUser}%`,
    };
  }

  if (id) {
    query.id = id;
  }
  let userQuery = `SELECT users.*, banks_for_users.id AS bank_id, banks_for_users.nameUser,banks_for_users.numberCard, banks_for_users.bankName, banks_for_users.branchName FROM users LEFT JOIN banks_for_users ON users.id = banks_for_users.user_id WHERE users.id=${id}`;

  userQuery += ` ORDER BY users.createdAt DESC LIMIT ${limit} OFFSET ${offset}`;
  const [data, _] = await sequelize.query(userQuery);
  try {
    if (data.length > 0) {
      var user = data[0];
      res.status(200).json({
        success: true,
        data: user,
        count: 1,
      });
    } else {
      res.status(200).json({
        success: true,
        data: null,
        count: 1,
        message: "Không tìm thấy user",
      });
    }
  } catch (error) {
    res.status(200).json({
      success: true,
      data: null,
      count: 1,
      message: error,
    });
  }
  // try {
  //   const limitValue = parseInt(limit, 10);
  //   const data = await User.findAll({
  //     where: query,
  //     offset,
  //     limit: limitValue,
  //     order: [["createdAt", "DESC"]],
  //     attributes: { exclude: ["password"] },
  //   });

  //   const count = await User.count({
  //     where: query,
  //   });

  //   res.status(200).json({
  //     success: true,
  //     data,
  //     count,
  //   });
  // } catch (error) {
  //   res.status(500).json({
  //     success: false,
  //     message: error.message,
  //   });
  // }
};

exports.listingUser = async (req, res) => {
  const defaultLimit = 10;
  const defaultPage = 1;
  let {
    page = 1,
    limit = 10,
    nameUser,
    id,
    transferCode,
    invitedCode,
  } = req.query;
  if (!limit) {
    limit = defaultLimit;
  }
  if (!page) {
    page = defaultPage;
  }

  const offset = (page - 1) * limit;
  const query = {};

  try {
    const limitValue = parseInt(limit, 10);
    let userQuery = `SELECT users.* FROM users 
    WHERE (:nameUser IS NULL OR users.address LIKE :nameUser) AND (:id IS NULL OR users.id = :id) AND (:transferCode IS NULL OR users.transferCode = :transferCode) AND (:invitedCode IS NULL OR users.invitedCode = :invitedCode)`;
    const replacements = {
      nameUser: nameUser ? `%${nameUser}%` : null,
      id: id ? id : null,
      transferCode: transferCode ? transferCode : null,
      invitedCode: invitedCode ? invitedCode : null,
      limit: limit ? parseInt(limit) : 10,
      offset: page ? (parseInt(page) - 1) * parseInt(limit) : 1,
    };

    if (Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        userQuery += ` AND ${key} = '${query[key]}'`;
      });
    }

    userQuery += ` ORDER BY users.createdAt DESC LIMIT ${limitValue} OFFSET ${offset}`;

    const [data, _] = await sequelize.query(userQuery, { replacements });

    let countQuery = `
  SELECT COUNT(*) AS totalCount
  FROM users 
  WHERE (:nameUser IS NULL OR users.address LIKE :nameUser) AND (:id IS NULL OR users.id = :id)`;
    if (Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        countQuery += ` AND ${key} = '${query[key]}'`;
      });
    }

    const totalCount = await sequelize.query(
      countQuery,
      {
        replacements: {
          nameUser: nameUser ? `%${nameUser}%` : null,
          id: id ? id : null,
        },
      },

      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const dataFinish = data.map((item) => {
      delete item.password;
      return item;
    });
    res.status(200).json({
      success: true,
      data: dataFinish,
      count: totalCount[0][0].totalCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Post new bank admin
exports.create_bank = async (req, res) => {
  try {
    const { bank_name, account_number, account_name, bank_branch } = req.body;

    // Xoá bản ghi cũ
    await Bank.destroy({ where: {} });

    const newBank = await Bank.create({
      bank_name,
      bank_account_number: account_number,
      bank_account_name: account_name,
      bank_account_branch: bank_branch,
    });
    res.status(200).json({
      success: true,
      newBank,
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    res.status(200).json({ success: false, message: error.message });
  }
};

//Delete Bank for User
exports.delete_bank_for_user = async (req, res) => {
  try {
    const bankId = req.body.bankId; // ID bank cần xoá, gửi từ client

    // Kiểm tra xem bankId có tồn tại trong bảng "bank_for_user" hay không
    const existingBank = await Bank.findByPk(bankId);
    if (!existingBank) {
      return res.status(404).json({
        success: false,
        message: "ID bank không tồn tại trong bảng 'bank_for_user'.",
      });
    }

    // Xoá bank theo ID
    await Bank.destroy({ where: { id: bankId } });
    res.status(200).json({
      success: true,
      message: "Xoá bank thành công.",
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
//create url app

exports.create_url = async (req, res) => {
  try {
    const { url } = req.body;

    // Xoá bản ghi cũ
    await UrlApp.destroy({ where: {} });

    const newUrl = await UrlApp.create({
      url,
    });
    res.status(200).json({
      success: true,
      newUrl,
    });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};

exports.update_url = async (req, res) => {
  try {
    const { url } = req.body;

    // Tìm và cập nhật bản ghi có id là 1
    const updatedUrl = await UrlApp.update({ url }, { where: { id: 1 } });

    res.status(200).json({
      success: true,
      updatedUrl,
    });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};

//KYC
exports.verifyAccount = async (req, res) => {
  try {
    const { idUser, idKyc, status } = req.body;
    const user = await User.findOne({ where: { id: idUser } });
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }
    // if(user.status != 1 || user.status != 2){
    //   return res.status(200).json({
    //     success: false,
    //     message: "Người dùng đã được xác minh",
    //   });
    // }
    const updatedUser = await User.update(
      { status },
      { where: { id: idUser } }
    );
    res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
    });
    let statusKYC = "";
    if (status == 3) {
      statusKYC = "approved";
    } else if (status == 1) {
      statusKYC = "rejected";
    } else {
      res.status(200).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }
    const updatedKYC = await KYC.update(
      { status: statusKYC },
      { where: { id: idKyc } }
    );
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
    console.log("Lỗi ở admin controller - KYC:", error);
  }
};

exports.kycListing = async (req, res) => {
  const defaultLimit = 10;
  const defaultPage = 1;
  let { page = 1, limit = 10, nameUser, id } = req.query;
  if (!limit) {
    limit = defaultLimit;
  }
  if (!page) {
    page = defaultPage;
  }

  const offset = (page - 1) * limit;

  try {
    // Xây dựng truy vấn lấy thông tin kyc
    let query = `SELECT kycs.id AS id, kycs.user_id AS userId, kycs.backImage, kycs.frontImage, kycs.status, kycs.real_name, kycs.identity_card, users.fullName 
                 FROM kycs 
                 LEFT JOIN users ON kycs.user_id = users.id`;

    if (nameUser) {
      query += ` WHERE users.fullName LIKE '%${nameUser}%'`;
    }

    if (id) {
      if (nameUser) {
        query += ` AND users.id = ${id}`;
      } else {
        query += ` WHERE users.id = ${id}`;
      }
    }

    query += ` ORDER BY kycs.createdAt DESC LIMIT ${limit} OFFSET ${offset}`;

    // Thực thi truy vấn lấy thông tin kyc
    const kycRecords = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    // Xây dựng truy vấn lấy tổng số bản ghi kyc
    let countQuery = `
    SELECT COUNT(*) AS totalCount
    FROM kycs
    LEFT JOIN users ON kycs.user_id = users.id`;

    if (nameUser) {
      countQuery += ` WHERE users.fullName LIKE '%${nameUser}%'`;
    }

    if (id) {
      if (nameUser) {
        countQuery += ` AND users.id = ${id}`;
      } else {
        countQuery += ` WHERE users.id = ${id}`;
      }
    }
    // Thực thi truy vấn lấy tổng số bản ghi kyc
    const totalCount = await sequelize.query(countQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    // Trả về kết quả
    res.status(200).json({
      success: true,
      data: kycRecords,
      totalCount: totalCount[0].totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

//Update User
exports.updateUser = async (req, res) => {
  const { id, balance_eth, balance_usdt, note } = req.body; // Lấy thông tin cần cập nhật từ request body
  try {
    // Tìm và cập nhật bản ghi có id là 1
    // let hashedPassword = "";
    // if (password) {
    //   hashedPassword = bcrypt.hashSync(password, 8);
    // }
    if (balance_usdt || balance_eth || note) {
      // if (!hashedPassword) {
      //   const user = await User.findByPk(id);
      //   hashedPassword = user?.dataValues?.password;
      // }
      const updatedUser = await User.update(
        {
          // phone,
          // fullName,
          balance_usdt,
          balance_eth,
          // transferCode,
          // securityCode,
          // status,
          // avatar,
          // rank,
          // creditScore,
          note,
          // password: hashedPassword,
        },
        { where: { id } }
      );
      if (updatedUser[0] === 0) {
        //update bank
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    }

    // if (numberCard || bankName || nameUser) {
    //   const [updatedBank] = await Bank.update(
    //     {
    //       numberCard,
    //       bankName,
    //       nameUser,
    //       branchName,
    //     },
    //     { where: { user_id: parseInt(id) } }
    //   );
    //   if (updatedBank === 0) {
    //     return res.status(404).json({
    //       success: false,
    //       message: "Bank not found for the user",
    //     });
    //   }
    // }

    res.status(200).json({
      success: true,
      message: "User information updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.statistics_overview = async (req, res) => {
  const today = moment().startOf("day");
  const sevenDaysAgo = moment().subtract(7, "days").startOf("day");
  const previousSevenDaysAgo = moment().subtract(14, "days").startOf("day");

  const query = `
    SELECT
      (SELECT COUNT(*) FROM users WHERE createdAt BETWEEN :sevenDaysAgo AND :today) AS userCount,
      (SELECT COUNT(*) FROM users WHERE createdAt BETWEEN :previousSevenDaysAgo AND :sevenDaysAgo) AS previousUserCount,
      COALESCE(CAST((SELECT SUM(CAST(amount AS DECIMAL(10,2))) FROM transactions WHERE typeTransaction = 'toup' AND status = 'approved' AND createdAt BETWEEN :sevenDaysAgo AND :today) AS DECIMAL(10,2)), 0) AS totalAmount,
      COALESCE(CAST((SELECT SUM(CAST(amount AS DECIMAL(10,2))) FROM transactions WHERE typeTransaction = 'toup' AND status = 'approved' AND createdAt BETWEEN :previousSevenDaysAgo AND :sevenDaysAgo) AS DECIMAL(10,2)), 0) AS previousTotalAmount,
      (SELECT COUNT(*) FROM order_histories WHERE createdAt BETWEEN :sevenDaysAgo AND :today) AS orderCount,
      (SELECT COUNT(*) FROM order_histories WHERE createdAt BETWEEN :previousSevenDaysAgo AND :sevenDaysAgo) AS previousOrderCount
  `;

  try {
    const result = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        sevenDaysAgo: sevenDaysAgo.toDate(),
        today: today.toDate(),
        previousSevenDaysAgo: previousSevenDaysAgo.toDate(),
      },
    });
    console.log("🚀 ~ exports.statistics_overview= ~ result:", result);

    const userCount = result[0].userCount;
    const previousUserCount = result[0].previousUserCount;
    const userPercentage =
      ((userCount - previousUserCount) / previousUserCount) * 100;

    const totalAmount = result[0].totalAmount || 0;
    const previousTotalAmount = result[0].previousTotalAmount || 0;
    const amountPercentage =
      ((totalAmount - previousTotalAmount) / previousTotalAmount) * 100;

    const orderCount = result[0].orderCount;
    const previousOrderCount = result[0].previousOrderCount;
    const orderPercentage =
      ((orderCount - previousOrderCount) / previousOrderCount) * 100;

    res.status(200).json({
      success: true,
      message: "Thống kê tổng quan",
      User: {
        total: userCount,
        percentage: userPercentage,
      },
      Amount: {
        totalAmount,
        amountPercentage: amountPercentage,
      },
      Order: {
        total: orderCount,
        percentage: orderPercentage,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tính số lượng người dùng đăng ký mới:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tính số lượng người dùng đăng",
    });
  }
};

exports.get_setup = async (req, res) => {
  try {
    const setup = await Setup.findAll({});
    res.status(200).json({
      success: true,
      data: setup,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.update_setup = async (req, res) => {
  const { id, value } = req.body;
  try {
    const setup = await Setup.update(
      {
        value,
      },
      { where: { id } }
    );
    if (setup[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "Setup not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Setup updated successfully ",
    });
  } catch (error) {
    console.log(error);
  }
};

// +- tiền cho user
exports.reward_and_punishment = async (req, res) => {
  const { id, amount } = req.body;

  try {
    // Kiểm tra người dùng có tồn tại hay không
    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Chuyển đổi kiểu dữ liệu balance thành số thập phân
    const currentBalance = parseFloat(user.balance);
    const requestedAmount = parseFloat(amount);

    // Kiểm tra nếu số tiền muốn trừ lớn hơn số dư hiện có
    if (requestedAmount < 0 && Math.abs(requestedAmount) > currentBalance) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    // Cập nhật số dư
    const updatedBalance = currentBalance + requestedAmount;

    // Cập nhật trường balance của người dùng
    await User.update(
      { balance: updatedBalance.toString() },
      { where: { id } }
    );

    // Lấy thông tin người dùng sau khi cập nhật
    const updatedUser = await User.findOne({ where: { id } });
    const balanceNow = updatedUser.balance;

    // Tạo một giao dịch nạp tiền mới
    const transaction = await TopupTransaction.create({
      user_id: id,
      amount: requestedAmount,
      typeTransaction: "manual",
      status: "approved",
      balanceNow: balanceNow,
      code: generateRandomString(),
    });

    return res
      .status(200)
      .json({ success: true, message: "Transaction completed successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.disable_user = async (req, res) => {
  const { id } = req.body;

  try {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Thay đổi trạng thái của người dùng thành 5
    await User.update({ status: 5 }, { where: { id } });

    return res
      .status(200)
      .json({ success: true, message: "User disabled successfully" });
  } catch (error) {
    console.error("Error disabling user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.un_disable_user = async (req, res) => {
  const { id } = req.body;

  try {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // if(user.status == 5){
    //   return res.status(400).json({message: 'User already locked'})
    // }

    // Thay đổi trạng thái của người dùng thành 5
    await User.update({ status: 1 }, { where: { id } });

    return res.status(200).json({ message: "User un disabled successfully" });
  } catch (error) {
    console.error("Error disabling user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get users disble
exports.get_users_disble = async (req, res) => {
  try {
    const { limit, page, id } = req.query;
    let defaultLimit = 10;
    let defaultPage = 1;
    let whereCondition = { status: 5 }; // Điều kiện mặc định: status = 5

    if (limit) {
      defaultLimit = parseInt(limit);
    }
    if (page) {
      defaultPage = parseInt(page);
    }
    if (id) {
      whereCondition.id = parseInt(id); // Thêm điều kiện: id = giá trị id được truyền vào
    }

    const offset = (defaultPage - 1) * defaultLimit;

    // Lấy danh sách người dùng thỏa mãn điều kiện và số lượng tổng cộng (count)
    const { count, rows: users } = await User.findAndCountAll({
      where: whereCondition,
      limit: defaultLimit,
      offset,
    });

    return res.status(200).json({ success: true, count, data: users });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};
