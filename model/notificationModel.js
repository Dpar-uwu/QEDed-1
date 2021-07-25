const mongoose = require("mongoose");
const { Schema } = mongoose;

const { LevelSchema } = require("./levelModel");

// creating user object schema
const NotificationSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        required: "Owner required"
    },
    subject: {
        type: String,
        required: "Subject required"
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
    NotificationSchema,

    sendNewAssignmentNotification: (owner, assignment_id) => {
        return new Promise(async (resolve, reject) => {
            // constructing subject
            let subject = "New Assignment from groupName";

            // constructing content
            let content = "A new assignment on skillName has been assigned. Go to blah blah"

            try {
                const newNoti = new Notification(owner, subject, content);
                const result = await newNoti.save();

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch(err) {
                console.error("ERROR! Could not send new assignment notification");
                reject(err);
            }
        })
    },
    sendCompletedNotification: () => {

    },

    /**
     * Email with notification
     */
    sendStudentWeeklyNotification: (owner) => {
        return new Promise(async (resolve, reject) => {
            // constructing subject
            let subject = "Weekly Update on Progress"

            // constructing content
            let content = ""
            try {
                const newNoti = new Notification(owner, subject, content);
                const result = await newFields.save();

                if(!result) throw "UNEXPECTED_ERROR";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch(err) {
                console.error("ERROR! Could not send new assignment notification");
                reject(err);
            }
        })
    },
    sendEducatorWeeklyNotification: () => {

    },
    sendDeadlineNotification: () => {

    }
}

module.exports = notificationModel;