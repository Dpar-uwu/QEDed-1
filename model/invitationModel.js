const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

// creating invitation object schema
const InvitationSchema = new Schema({
    invite_by: {
        type: ObjectId,
        required: "Owner of invite required"
    },
    invitee: {
        type: String,
        required: "Invitee required"
    },
    group_id: {
        type: ObjectId,
        required: "Group ID of the invite is required"
    },
    status: {
        type: String,
        enum: ["accepted", "rejected", "pending"],
        default: "pending"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Invitation = mongoose.model("Invitation", InvitationSchema)

const invitationModel = {
    InvitationSchema,
    // get all invitation
}

module.exports = invitationModel;