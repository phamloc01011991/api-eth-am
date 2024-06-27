const db = require("../../app/models");
const Notify = db.notify_global;
const NotifyForUser = db.notify_for_user;


exports.create = async (req, res) => {
    try {
        const create = await Notify.create({
            title: req.body.title,
            content: req.body.content,
        })
        res.status(200).send({
            message: "Create notify success",
            success: true,
            data: create
        })

    } catch (error) {
        console.log(error);
    }
}

exports.listing = async (req, res) =>{
    try {
        const listing = await Notify.findAll({
            order: [
                ['id', 'DESC']
            ],
            limit: 3
        })
        res.status(200).send({
            message: "Listing notify success",
            success: true,
            data: listing
        })
    } catch (error) {
        console.log(error);
    }
}

exports.listing_for_id = async (req, res) =>{
    try {
        const id = req.body.id;
        const data = await Notify.findAll({
            where: {
                id: id
            }
        })
        res.status(200).send({
            message: "Listing notify success",
            success: true,
            data: data
        })
    } catch (error) {
        console.log(error);
    }
   

}

exports.update = async (req, res) =>{
    const {title, content, status, id} = req.body;
    try {
        const update = await Notify.update({
            title: title,
            content: content,
            status: status
        },{
            where: {
                id: id
            }
        })
        res.status(200).send({
            message: "Update notify success",
            success: true,
            data: update
        })
    }
    catch (error) {
        console.log(error);
    }

}
exports.create_for_user = async (req, res) =>{
    const {title, content, status, id} = req.body;
    try {
        const create = await NotifyForUser.create({
            user_id: id,
            title: title,
            content: content,
            status: status
        })
        res.status(200).send({
            message: "Create notify for user success",
            success: true,
            data: create
        })
    }
    catch (error) {
        console.log(error);
    }


    
}