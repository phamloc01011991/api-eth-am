const db = require("../../app/models");
const Staking = db.staking;

exports.create = async (req, res) => {
  console.log("🚀 ~ exports.create= ~ req:", req.body);
  try {
    const create = await Staking.create({
      ...req.body,
    });
    res.status(200).send({
      message: "Create notify success",
      success: true,
      data: create,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.listing = async (req, res) => {
  try {
    const listing = await Staking.findAll();
    res.status(200).send({
      message: "Listing notify success",
      success: true,
      data: listing,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { dateHold, interestRate, type, description } = req.body;

  try {
    const update = await Staking.update(
      {
        dateHold,
        interestRate,
        type,
        description,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.status(200).send({
      message: "Update notify success",
      success: true,
      data: update,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Staking.destroy({ where: { id } });

    res.status(200).json({ success: true, message: "Xoá  thành công." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
