const db = require("../../app/models");
const Blog = db.blog;

exports.create = async (req, res) => {
  try {
    const create = await Blog.create({
      ...req.body,
    });
    res.status(200).send({
      message: "Create notify success",
      success: true,
      data: create,
    });
  } catch (error) {
    console.log("🚀 ~ exports.create= ~ error:", error);
    console.log(error);
  }
};

exports.listing = async (req, res) => {
  try {
    const listing = await Blog.findAll();
    res.status(200).send({
      message: "Listing notify success",
      success: true,
      data: listing,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.detail = async (req, res) => {
  try {
    console.log("🚀 ~ exports.detail= ~ req.params.id:", req.params.id);
    const id = req.params.id;
    const listing = await Blog.findOne({ where: { id } });
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
  const { actived, title, description } = req.body;

  try {
    const update = await Blog.update(
      {
        actived,
        title,
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
    await Blog.destroy({ where: { id } });

    res.status(200).json({ success: true, message: "Xoá thành công." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
