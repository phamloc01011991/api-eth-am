const db = require("../../app/models");
const config = require("../config/auth.config");
const dbAdmin = require("../../admin/models");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const ConfigInterest = dbAdmin.config_interest;

const configApp = dbAdmin.config;
const Transaction = db.transaction;
const User = db.user;
const Bank = db.banks_for_users;
const bankAdmin = dbAdmin.bank;
const urlApp = db.url_app;
const Order = db.order_history;
const TrackingBalance = db.tracking_balance;

const sequelize = db.sequelize;
const KYC = db.kyc;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { ENUM_TRANSACTION, ENUM_STATUS } = require("../../enum");

exports.getInfo = async (req, res) => {
  try {
    const { address } = req.query;

    const user = await User.findOne({
      where: { address },
    });

    if (!user) {
      throw new Error("INVALID_USER");
    }

    const responseData = {
      data: { ...user?.dataValues },
      success: true,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header Authorization
    // Giải mã token và lấy thông tin từ payload
    const decodedToken = jwt.verify(token, config.secret);
    const userId = decodedToken.id;
    const { avatar, fullName } = req.body;
    const data = await User.update(
      {
        avatar,
        fullName,
      },
      {
        where: {
          id: userId,
        },
      }
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.new_bank = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header Authorization

    // Giải mã token và lấy thông tin từ payload
    const decodedToken = jwt.verify(token, config.secret);
    const userId = decodedToken.id;

    const { bank_name, number_card, branch_name, name_user } = req.body;
    // Kiểm tra số thẻ không được trùng
    // const existingBank = await Bank.findOne({
    //   where: {
    //     numberCard: number_card,
    //   },
    // });

    // if (existingBank) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Số thẻ đã tồn tại" });
    // }
    const newBank = await Bank.create({
      user_id: userId,
      numberCard: number_card,
      bankName: bank_name,
      branchName: branch_name,
      nameUser: name_user,
    });

    res.status(201).json({ success: true, newBank });
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//Check Bank
exports.check_bank = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header Authorization

    // Giải mã token và lấy thông tin từ payload
    const decodedToken = jwt.verify(token, config.secret);
    const userId = decodedToken.id;

    const bank = await Bank.findOne({
      where: {
        user_id: userId,
      },
    });

    if (bank) {
      // Ẩn số giữa trong chuỗi numberCard
      const numberCard = bank.numberCard;
      const maskedNumberCard = maskMiddleDigits(numberCard);

      // Hàm tùy chỉnh để ẩn số giữa trong chuỗi
      function maskMiddleDigits(cardNumber) {
        const visibleDigits = Math.floor(cardNumber.length / 2);
        const firstVisibleDigitIndex = Math.floor(
          (cardNumber.length - visibleDigits) / 2
        );
        const lastVisibleDigitIndex =
          firstVisibleDigitIndex + visibleDigits - 1;
        const maskedDigits = _.repeat("*", visibleDigits);
        return _.replace(
          cardNumber,
          new RegExp(
            `^(.{${firstVisibleDigitIndex}}).+(.{${
              cardNumber.length - lastVisibleDigitIndex - 1
            }})$`
          ),
          `$1${maskedDigits}$2`
        );
      }

      // Gán giá trị mới cho trường numberCard
      bank.numberCard = maskedNumberCard;

      // Nếu tìm thấy bank, trả về thông tin bank của người dùng
      res.status(200).json({ success: true, bank });
    } else {
      // Nếu không tìm thấy bank, trả về thông báo lỗi
      res.status(200).json({ success: false, message: "Bank not found" });
    }
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.kyc = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header Authorization
    // Giải mã token và lấy thông tin từ payload
    const decodedToken = jwt.verify(token, config.secret);
    const userId = decodedToken.id;

    const { frontImage, backImage, realName, identityCard } = req.body;
    const newKYC = await KYC.create({
      user_id: userId,
      frontImage: frontImage,
      backImage: backImage,
      real_name: realName,
      identity_card: identityCard,
    });
    const updateUser = await User.update(
      {
        status: 2,
      },
      {
        where: {
          id: userId,
        },
      }
    );
    res.status(201).json({ success: true, newKYC });
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.kycUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header Authorization
    // Giải mã token và lấy thông tin từ payload
    const decodedToken = jwt.verify(token, config.secret);
    const userId = decodedToken.id;

    const infoKyc = await KYC.findOne({
      where: { user_id: userId },
    });
    res.status(201).json({ success: true, data: infoKyc });
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.info_bank_admin = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header Authorization
    const { limit, page } = req.query; // Lấy giá trị limit và page từ query params

    // Giải mã token và lấy thông tin từ payload
    const decodedToken = jwt.verify(token, config.secret);
    const userId = decodedToken.id;

    const user = await User.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new Error("INVALID_USER");
    }
    const content = user.transferCode;
    const data = await bankAdmin.findAll();
    const dataPro = data.map((item) => {
      return {
        ...item.dataValues,
        content,
      };
    });
    res.status(200).json({
      success: true,
      data: {
        ...dataPro,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// exports.listing_transaction = async (req, res) => {
//   const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header Authorization

//   // Giải mã token và lấy thông tin từ payload
//   const decodedToken = jwt.verify(token, config.secret);
//   const userId = decodedToken.id;
//   try {
//     const defaultPage = 1;
//     const defaultLimit = 10;
//     const limit = req.query.limit ? parseInt(req.query.limit) : defaultLimit;
//     const page = req.query.page ? parseInt(req.query.page) : defaultPage;

//     const itemsPerPage = 10; // Số lượng bản ghi trong mỗi bảng

//     const offset = itemsPerPage * (page - 1);
//     const dataNow = await Transaction.findAll({
//       where: {
//         user_id: userId,
//       },
//       limit: limit,
//       offset: offset,
//       order: [["createdAt", "DESC"]],
//     });
//     const count = await Transaction.count({
//       where: {
//         user_id: userId,
//       },
//     });

//     // Trả về dữ liệu cho client
//     res.status(200).json({
//       success: true,
//       data: dataNow,
//       count,
//     });
//   } catch (error) {
//     console.log("Lỗi rồi:___", error);
//   }
// };

exports.listing_transaction = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header Authorization

  // Giải mã token và lấy thông tin từ payload
  const decodedToken = jwt.verify(token, config.secret);
  const userId = decodedToken.id;
  try {
    const defaultPage = 1;
    const defaultLimit = 10;
    const limit = req.query.limit ? parseInt(req.query.limit) : defaultLimit;
    const page = req.query.page ? parseInt(req.query.page) : defaultPage;
    const typeTransaction = req.query.typeTransaction; // Trường tìm kiếm theo typeTransaction
    const type = req.query.type;
    const itemsPerPage = 10; // Số lượng bản ghi trong mỗi bảng

    const offset = itemsPerPage * (page - 1);
    const whereCondition = {
      user_id: userId,
    };

    if (typeTransaction) {
      whereCondition.typeTransaction = typeTransaction;
    }
    if (type) {
      whereCondition.type = type;
    }
    const dataNow = await Transaction.findAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });
    const count = await Transaction.count({
      where: whereCondition,
    });

    // Trả về dữ liệu cho client
    res.status(200).json({
      success: true,
      data: dataNow,
      count,
    });
  } catch (error) {
    console.log("Lỗi rồi:___", error);
  }
};

exports.get_url = async (req, res) => {
  try {
    const data = await urlApp.findAll();

    res.status(200).json({
      success: true,
      data: {
        ...data,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.listing_config_interest = async (req, res) => {
  try {
    const data = await ConfigInterest.findAll();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//Config
exports.get_config = async (req, res) => {
  try {
    const data = await configApp.findOne({
      where: {
        id: 1,
      },
    });
    res.status(200).send({
      message: "Get config success",
      success: true,
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

//Thống kê

exports.thongke = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header Authorization

    // Giải mã token và lấy thông tin từ payload
    const decodedToken = jwt.verify(token, config.secret);
    const userId = decodedToken.id;
    //Lấy thời điểm hiện tại
    const result = Array(7).fill(0);
    let updateAt;
    // Lặp qua từng ngày trong 7 ngày gần đây
    for (let i = 0; i < 7; i++) {
      // Lấy ngày hiện tại trừ đi số ngày
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);

      // Lấy ngày bắt đầu của ngày hiện tại (00:00:00)
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);

      // Lấy ngày kết thúc của ngày hiện tại (23:59:59)
      const endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);

      // Truy vấn bảng order với điều kiện ngày tạo trong khoảng thời gian từ 00:00:00 đến 23:59:59 của ngày hiện tại
      const orders = await TrackingBalance.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
          user_id: userId,
        },
      });

      if (orders?.[0]?.createdAt && i === 0) {
        updateAt = orders?.[0]?.createdAt;
      }

      // Tính tổng của total dựa vào type và cập nhật vào mảng kết quả
      orders.forEach((order) => {
        result[i] = order.price;
      });
    }
    const user = await User.findByPk(userId);
    return res.status(200).json({
      success: true,
      data: {
        list: result.reverse(),
        updateAt: updateAt ? updateAt : user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.listTransaction = async (req, res) => {
  try {
    const { address, limit, page = 1 } = req.query;
    const limitValue = parseInt(limit, 10);
    const offset = (page - 1) * limit;
    const dataUser = await User.findOne({
      where: { address },
    });

    if (!dataUser) throw new Error("INVALID_USER");
    const data = await Transaction.findAll({
      where: {
        user_id: dataUser?.id,
        typeTransaction: {
          [Op.in]: [
            ENUM_TRANSACTION.toup,
            ENUM_TRANSACTION.transfer,
            ENUM_TRANSACTION.withdrawal,
            ENUM_TRANSACTION.mining,
          ],
        },
      },
      limit: limitValue,
      offset,
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.listReferral = async (req, res) => {
  try {
    const { address } = req.query;

    const dataUser = await User.findOne({
      where: { address },
    });

    if (!dataUser) throw new Error("INVALID_USER");
    let stakingsQuery = ` SELECT
    t.*,
    u.balance_eth as balance_eth_referral
  FROM
  transactions t
  JOIN
  users u ON u.address = JSON_UNQUOTE(JSON_EXTRACT(t.note, '$.address'))
  WHERE (t.user_id = ${dataUser?.id})
    AND (t.typeTransaction = '${ENUM_TRANSACTION.reward}') 
    AND (t.status = '${ENUM_STATUS.approved}') 
    ORDER BY t.createdAt DESC
    LIMIT 20 ;
`;

    const [data, _] = await sequelize.query(stakingsQuery);

    // const data = await Transaction.findAll({
    //   where: {
    //     user_id: dataUser?.id,
    //     typeTransaction: ENUM_TRANSACTION.reward,
    //     status: ENUM_STATUS.approved,
    //   },
    //   limit: 20,
    //   // offset,
    //   order: [["createdAt", "DESC"]],
    // });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.forget_password = async (req, res) => {
  const { securityCode, emailUser, phone } = req.body;
  console.log("🚀 ~ exports.forget_password= ~ securityCode:", securityCode);

  // Kiểm tra phone và securityCode có trùng với dữ liệu trong bảng User hay không
  const user = await User.findOne({
    where: {
      phone: phone,
      securityCode: securityCode,
    },
  });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Số điện thoại hoặc mã bảo mật không chính xác",
    });
  }
  // Tạo một đối tượng vận chuyển (transporter) để cấu hình cách gửi email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "finance.exness.trade@gmail.com",
      pass: "akgpmkjycltgvriv",
    },
  });
  let newPassword = "";
  let code = "";
  const characters = "abcdefghikjlmnopqrstuvwxyz0123456789";
  const codeLength = 7;
  // Tạo một chuỗi ngẫu nhiên với độ dài bằng codeLength
  const potentialCode = Array.from(
    { length: codeLength },
    () => characters[Math.floor(Math.random() * characters.length)]
  ).join("");
  code = potentialCode;
  newPassword = code;

  //Cập nhật mật khẩu mới theo newPassword
  // Cập nhật mật khẩu mới trong bảng User
  user.password = bcrypt.hashSync(newPassword, 8);
  await user.save();

  // Định nghĩa các thuộc tính của email (người gửi, người nhận, tiêu đề, nội dung...)
  const mailOptions = {
    from: {
      name: "Admin Exness",
      address: "finance.exness.trade@gmail.com",
    },
    to: `${emailUser}`,
    subject: "Mật khẩu mới",
    text: "Xin chào, Dưới đây là mật khẩu mới của bạn",
    html: `Mật khẩu mới của bạn là <b> ${newPassword}</b> vui lòng không để lộ mật khẩu mới của bạn cho bất ký ai</b>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Gửi email thất bại: " + error);
      return res
        .status(500)
        .json({ success: false, message: "Có lỗi trong quá trình gửi email" });
    } else {
      console.log("Email đã được gửi thành công: " + info.response);
      return res.status(200).json({
        success: true,
        message: "Mật khẩu mới đã được gửi đến email của bạn",
      });
    }
  });
};
