const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

// creating group object schema
const GroupSchema = new Schema({
    owner: {
        type: ObjectId,
        required: "Owner of group required"
    },
    assignmentsListId: {
        type: [ObjectId],
        required: "Invitee required"
    },
    members: {
        type: [{
            user_id: {
                type: ObjectId,
                required: "User ID required"
            },
            // role: {
            //     type: String,
            //     lowercase: true,
            //     required: "Role of user required",
            //     enum: ["student", "teacher", "parent", "admin"]
            // },
            is_admin: {
                type: Boolean,
                default: false,
                required: "Admin tag required"
            }
        }]
    }
    // admin: {
    //     type: {ObjectId},
    //     required: "Group ID of the invite is required"
    // },
    // student_members: {
    //     type: [ObjectId],
    //     required: "Student members required"
    // },
    // group_members: {
    //     type: [ObjectId],
    //     required: "Group members required"
    // }
});

const Group = mongoose.model("Group", GroupSchema)

const groupModel = {
    GroupSchema,
    // get all groups
}

module.exports = groupModel;