const mongoose = require("mongoose");
const { Schema } = mongoose;

// creating user object schema
const NotificationSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        required: "Owner required"
    },
    content: {
        type: String,
        required: "Question Number is required"
    },
    unread: {
        type: Boolean,
        required: "Read status required",
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model("Notification", NotificationSchema)

const notificationModel = {
    NotificationSchema
}

module.exports = notificationModel;