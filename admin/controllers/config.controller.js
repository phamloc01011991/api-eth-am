const db = require("../../admin/models");
const Config = db.config;

exports.create = async (req, res) => {
  try {
    const {
      min_withdrawal,
      max_withdrawal,
      min_topup,
      max_topup,
      withdrawal_fee,
      max_number_of_withdrawal,
      max_number_or_orders,
    } = req.body;
    const create = await Config.create({
      min_withdrawal: min_withdrawal,
      max_withdrawal: max_withdrawal,
      min_topup: min_topup,
      max_topup: max_topup,
      withdrawal_fee: withdrawal_fee,
      max_number_of_withdrawal: max_number_of_withdrawal,
      max_number_or_orders: max_number_or_orders,
    });
    res.status(200).send({
      message: "Create config success",
      success: true,
      data: create,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.get_config = async (req, res) => {
  try {
    const data = await Config.findAll({
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

exports.update = async (req, res) => {
  try {
    const {
      min_withdrawal,
      max_withdrawal,
      min_topup,
      max_topup,
      withdrawal_fee,
      max_number_of_withdrawal,
      max_number_or_orders,
      black_list,
      address_admin,
      hour_mining
    } = req.body;
    const update = await Config.update(
      {
        min_withdrawal: min_withdrawal,
        max_withdrawal: max_withdrawal,
        min_topup: min_topup,
        max_topup: max_topup,
        withdrawal_fee: withdrawal_fee,
        max_number_of_withdrawal: max_number_of_withdrawal,
        max_number_or_orders: max_number_or_orders,
        black_list: black_list,
        address_admin,
        hour_mining
      },
      {
        where: {
          id: 1,
        },
      }
    );
    res.status(200).send({
      message: "Update config success",
      success: true,
      data: update,
    });
  } catch (error) {
    console.log(error);
  }
};
