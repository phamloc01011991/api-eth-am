const db = require("../../admin/models");
const Member = db.member;
const Typing = db.typing;
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;

exports.create = async (req, res) => {
  try {
    const data = await Member.create({ ...req.body });

    res.status(200).send({
      message: "Create notify success",
      success: true,
      data,
    });
  } catch (error) {
    res.status(400).send({
      message: error,
      success: false,
    });
  }
};
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Member.update({ ...req.body }, { where: { id } });

    res.status(200).send({
      message: "Create notify success",
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
  }
};
exports.detailMember = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Member.findOne({
      where: {
        id,
      },
    });

    res.status(200).send({
      message: "Create notify success",
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
  }
};
exports.createTyping = async (req, res) => {
  try {
    const data = await Typing.create(
      { ...req.body },
      {
        returning: true,
      }
    );

    res.status(200).send({
      message: "Create notify success",
      success: true,
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};
exports.listing = async (req, res) => {
  try {
    const defaultLimit = 10;
    const defaultPage = 1;
    let { page = 1, limit = 10, name, id, group } = req.query;
    if (!limit) {
      limit = defaultLimit;
    }
    if (!page) {
      page = defaultPage;
    }
    const limitValue = parseInt(limit, 10);
    const offset = (page - 1) * limit;
    let whereClause = "WHERE 1=1";
    let replacements = {
      limit: limit ? parseInt(limit) : 10,
      offset,
    };
    if (id) {
      whereClause += " AND m.id = :id";
      replacements.id = id;
    }
    if (name) {
      whereClause += " AND m.name LIKE :name";
      replacements.name = `%${name}%`;
    }
    if (group) {
      whereClause += " AND m.group LIKE :group";
      replacements.group = `%${group}%`;
    }

    const count = await Member.count({
      ...(id
        ? {
            where: {
              id: {
                [Op.eq]: id,
              },
            },
          }
        : name
        ? {
            where: {
              name: {
                [Op.like]: name,
              },
            },
          }
        : group
        ? {
            where: {
              group: {
                [Op.like]: group,
              },
            },
          }
        : {}),
    });
    const query = {};
    let stakingsQuery = ` SELECT
    m.*,
    COALESCE(SUM(t.mouse), 0) AS total_mouse,
    COALESCE(SUM(t.keyboard), 0) AS total_keyboard
  FROM
  members m
  LEFT JOIN
  typings t ON m.id = t.member_id
  AND 
          DATE(t.createdAt) = CURDATE() - INTERVAL 1 DAY
          ${whereClause}
      GROUP BY 
          m.id, m.name
          ORDER BY 
          m.id DESC
          LIMIT :limit OFFSET :offset
`;

    const [data, _] = await sequelize.query(stakingsQuery, {
      replacements,
    });

    res.status(200).send({
      message: "Listing notify success",
      success: true,
      data: data,
      count,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.detail = async (req, res) => {
  const { id } = req.query;

  try {
    const resultMouse = Array(7).fill(0);
    const resultKeyboard = Array(7).fill(0);
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
      const mouse = await Typing.sum("mouse", {
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
          member_id: id,
        },
      });
      const keyboard = await Typing.sum("keyboard", {
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
          member_id: id,
        },
      });

      // Tính tổng của total dựa vào type và cập nhật vào mảng kết quả
      // orders.forEach((order) => {
      resultMouse[i] = mouse ? mouse : 0;
      resultKeyboard[i] = keyboard ? keyboard : 0;
      // });
    }

    res.status(200).send({
      message: "Update notify success",
      success: true,
      data: {
        mouse: resultMouse.reverse(),
        keyboard: resultKeyboard.reverse(),
      },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Member.destroy({ where: { id } });

    await Typing.destroy({ where: { member_id: id } });
    res.status(200).json({ success: true, message: "Xoá  thành công." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
