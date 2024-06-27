const config = require("../../admin/config/auth.config");
const db = require("../../admin/models");
const sequelize = db.sequelize;
const axios = require("axios");
const dbUser = require("../../app/models");
const { ENUM_COIN } = require("../../enum");
const TopupTransaction = dbUser.transaction;
const rewardAndPunishment = dbUser.transaction;
const NotifyForUser = dbUser.notify_for_user;
const User = dbUser.user;

exports.confirm_toup = async (req, res) => {
  try {
    const { transactionId, status } = req.body;
    // Kiểm tra xem trạng thái có hợp lệ hay không
    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Cập nhật trạng thái của giao dịch nạp tiền
    const transaction = await TopupTransaction.findByPk(transactionId);
    // const transactioncheck = await TopupTransaction.findOne({
    //   where: { id: transactionId },
    // });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    // Kiểm tra trạng thái hiện tại của giao dịch
    if (transaction.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Transaction status cannot be updated" });
    }
    transaction.status = status;
    await transaction.save();
    // Nếu trạng thái là "approved", cập nhật số dư của người dùng
    if (status === "approved") {
      const user = await User.findByPk(transaction.user_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Chuyển đổi số tiền từ VND sang USD

      // Cộng thêm số tiền vào trường balance của người dùng
      if (transaction?.source === ENUM_COIN.eth) {
        user.balance_eth =
          parseFloat(user.balance_eth) + parseFloat(transaction?.amount);
      } else {
        user.balance_usdt =
          parseFloat(user.balance_usdt) + parseFloat(transaction?.amount);
      }

      // Lấy giá trị balance hiện tại của người dùng sau khi cộng thêm
      await user.save();

      // ******************
      // if (user.invitedCode) {
      //   // Tìm người giới thiệu
      //   const referrer = await User.findOne({
      //     where: { referralCode: user.invitedCode },
      //   });

      //   // Nếu tìm thấy người giới thiệu
      //   if (referrer) {
      //     // Kiểm tra xem người giới thiệu đã nhận tiền thưởng chưa
      //     const hasReceivedBonus = await TopupTransaction.findOne({
      //       where: {
      //         user_id: referrer.id,
      //         typeTransaction: "bonus",
      //         amount: { [Sequelize.Op.gt]: 0 },
      //       },
      //     });
      //     // Nếu người giới thiệu chưa nhận tiền thưởng, cộng tiền thưởng cho họ
      //     if (!hasReceivedBonus) {
      //       const dataConfig = await Config.findAll({
      //         where: {
      //           id: 1,
      //         },
      //       });
      //       const bonusAmount = dataConfig[0].dataValues.bonus_refferal;
      //       console.log(
      //         "🚀 ~ exports.confirm_toup= ~ bonusAmount:",
      //         bonusAmount
      //       );

      //       const usdAmount = (bonusAmount / rate).toFixed(2);
      //       console.log("🚀 ~ exports.confirm_toup= ~ usdAmount:", usdAmount);
      //       // Cộng thêm số tiền vào trường balance của người giới thiệu
      //       referrer.balance =
      //         parseFloat(referrer.balance) + parseFloat(usdAmount);

      //       // Lấy giá trị balance hiện tại của người giới thiệu sau khi cộng thêm
      //       // await referrer.save();
      //       const updatedUserReferrer = await referrer.save();
      //       const balanceReferrerNow = updatedUserReferrer.balance;
      //       console.log(
      //         "🚀 ~ exports.confirm_toup= ~ balanceReferrerNow:",
      //         balanceReferrerNow
      //       );
      //       // Tạo một giao dịch nạp tiền mới
      //       await TopupTransaction.create({
      //         user_id: referrer.id,
      //         amount: bonusAmount,
      //         typeTransaction: "bonus",
      //         amount_usd: usdAmount,
      //         status: "approved",
      //         balanceNow: balanceReferrerNow,
      //       });
      //       const notifyData = {
      //         user_id: referrer.id,
      //         title: "Giới thiệu thành công",
      //         content: `Số tiền ${usdAmount}$ của bạn đã được cộng vào tài khoản.`,
      //       };
      //       console.log("🚀 ~ exports.confirm_toup= ~ notifyData:", notifyData);
      //       await NotifyForUser.create(notifyData);
      //     }
      //   }
      // }
      // ******************

      // Cập nhật trường balanceNow trong bảng WithdrawalTransaction

      const notifyData = {
        user_id: user.id,
        title: "Lệnh nạp USD thành công",
        titleEnglish: "USD deposit order successful",
        content: `Lệnh nạp ${transaction.amount_usd}$ của bạn đã được duyệt và cộng vào tài khoản.`,
        contentEnglish: `Your deposit order ${transaction.amount_usd}$ has been approved and added to your account.`,
      };
      await NotifyForUser.create(notifyData);
    } else if (status === "rejected") {
      const notifyData = {
        user_id: transaction.user_id,
        title: "Lệnh nạp USD thất bại",
        titleEnglish: "USD deposit order failed",
        content: `Lệnh nạp ${transaction.amount_usd}$ của bạn đã bị từ chối.`,
        contentEnglish: `Your deposit ${transaction.amount_usd}$ has been rejected.`,
      };
      await NotifyForUser.create(notifyData);
      return res.status(200).json({ message: "Transaction rejected" });
    }
    res.status(200).json({ message: "Transaction updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
