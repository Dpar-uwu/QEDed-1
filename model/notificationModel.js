const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose;

// creating user notification schema
const NotificationSchema = new Schema({
    to: {
        type: [{
            user_id: {
                type: ObjectId,
                required: "To required"
            },
            unseen: {
                type: Boolean,
                default: false
            },
            unread: {
                type: Boolean,
                default: true
            },
        }]
    },
    assignment_id: {
        type: ObjectId
    },
    skill_id: {
        type: ObjectId
    },
    quiz_id: {
        type: ObjectId
    },
    subject: {
        type: String,
        required: "Subject required"
    },
    content: {
        type: String,
        required: "Content is required"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model("Notification", NotificationSchema)

const notificationModel = {
    NotificationSchema,
    /**
     * Website Notification
     */
    // get all notification by user id
    getNotificationByUser: (user_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Notification.aggregate([
                    {
                        $match: {
                            "to.user_id": ObjectId(user_id)
                        }
                    },
                    {
                        $unwind: "$to"
                    },
                    {
                        $match: {
                            $and: [
                                {"to.user_id": ObjectId(user_id)},
                                {"to.unseen": false}
                            ] 
                        }
                    },
                    {
                        $lookup: {
                            from: "assignments",
                            localField: "assignment_id",
                            foreignField: "_id",
                            as: "asg_assignment"
                        }
                    },
                    {
                        $addFields: {
                            assignment_title: {
                                $first: {
                                    $map: {
                                        input: "$asg_assignment",
                                        as: "asg",
                                        in: "$$asg.title"
                                    }
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "quizzes",
                            localField: "quiz_id",
                            foreignField: "_id",
                            as: "quiz"
                        }
                    },
                    {
                        $addFields: {
                            quiz_assignment_id: {
                                $first: {
                                    $map: {
                                        input: "$quiz",
                                        as: "quiz",
                                        in: "$$quiz.assignment_id"
                                    }
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "assignments",
                            localField: "quiz_assignment_id",
                            foreignField: "_id",
                            as: "quiz_assignment"
                        }
                    },
                    {
                        $addFields: {
                            quiz_assignment_title: {
                                $first: {
                                    $map: {
                                        input: "$quiz_assignment",
                                        as: "quiz_asg",
                                        in: "$$quiz_asg.title"
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            // user: 1,
                            asg_assignment: 0,
                            quiz: 0,
                            quiz_assignment: 0
                        }
                    }
                ])
                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not get notifications by userid:", err);
                reject(err);
            }
        })
    },

    // get notification details by notification id 
    // if with assignment redirect to assignment page 
    // if with quiz id, show student progress 
    getNotificationById: (notificationId, user_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Notification.aggregate([
                    {
                        $match: {
                            _id: ObjectId(notificationId)
                        }
                    },
                    {
                        $unwind: "$to"
                    },
                    {
                        $match: {
                            "to.user_id": ObjectId(user_id)
                        }
                    },
                    // for NewAssignment noti
                    {
                        $lookup: {
                            from: "assignments",
                            localField: "assignment_id",
                            foreignField: "_id",
                            as: "asg_assignment"
                        }
                    },
                    {
                        $addFields: {
                            assignment_title: {
                                $first: {
                                    $map: {
                                        input: "$asg_assignment",
                                        as: "asg",
                                        in: "$$asg.title"
                                    }
                                }
                            }
                        }
                    },
                    // for AssignmentCompleted noti
                    {
                        $lookup: {
                            from: "quizzes",
                            localField: "quiz_id",
                            foreignField: "_id",
                            as: "quiz"
                        }
                    },
                    {
                        $addFields: {
                            quiz_assignment_id: {
                                $first: {
                                    $map: {
                                        input: "$quiz",
                                        as: "quiz",
                                        in: "$$quiz.assignment_id"
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            asg_assignment: 0,
                            quiz: 0
                        }
                    }
                ])
                if (!result) throw "NOT_FOUND";

                // update unseen to true 
                const query = {"to.user_id": ObjectId(user_id)};
                const update = {
                    $set: {"to.$.unseen": true}
                };
                const updateDoc = await Notification.updateMany(query, update)
                console.log(updateDoc);

                console.log("Result: ", result);
                resolve(result);
            } catch (err) {
                console.error("Error! Could not get notification by id: ", err);
                reject(err);
            }
        })
    },

    // create notification (student)
    // student receive notification when educator assign work
    createNotiByAsgId: (to, assignment_id, skill_id, subject, content) => {
        return new Promise(async (resolve, reject) => {
            try {
                const newNoti = new Notification({ to, assignment_id, skill_id, subject, content })
                const result = await newNoti.save();

                if (!result) throw "UNEXPECTED_ERROR";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not create notification by asgId", err);
                reject(err);
            }
        })
    },

    // create notification (educator)
    // educator receive noti when student completed their work
    createNotiByQuizId: (to, quiz_id, subject, content) => {
        return new Promise(async (resolve, reject) => {
            try {
                const newNoti = new Notification({ to, quiz_id, subject, content })
                const result = await newNoti.save();

                if (!result) throw "UNEXPECTED_ERROR";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not create notification by quizId", err);
                reject(err);
            }
        })
    },

    // dismiss noti for user by id
    dismissNotificationById: (user_id, notificationId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const noti = await Notification.findOne({ "_id": ObjectId(notificationId) });
                if (!noti) throw "NOT_FOUND"

                const to = noti.to.find(element => element.user_id == user_id);
                console.log(to)
                const isUnseen = to.unseen;
                console.log(isUnseen)
                if (isUnseen == true) throw "UNEXPECTED_ERROR"

                to.unseen = !to.unseen;
                const result = noti.save();

                console.log("Result: ", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not delete noti with id ${notificationId}: ${err}`);
                reject(err);
            }
        })
    },

    // dismiss all by userid 
    dismissAllNotificationByUser: (user_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const query = {"to.user_id": ObjectId(user_id)};
                const update = {
                    $set: {"to.$.unseen": true}
                };
                const result = await Notification.updateMany(query, update)

                console.log("Result: ", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not dismiss all notifications by userid:", err);
                reject(err);
            }
        })
    },
    
    /**
     * 
     * Email Notification  
     */
    // outstanding quizzes + summary(performance + how many student did a particular quiz)??
    sendStudentWeeklyNotification: (user_id, subject, content) => {
        return new Promise(async (resolve, reject) => {
            // constructing subject
            let subject = "Weekly Update on Progress"

            // constructing content
            let content = ""
            try {
                const newNoti = new Notification(owner, subject, content);
                const result = await newFields.save();

                if (!result) throw "UNEXPECTED_ERROR";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not send student weekly progress");
                reject(err);
            }
        })
    },
    // quizzes that student completed + quizzes undone + their result?
    sendEducatortWeeklyNotification: () => { },

    // related user will recieve an email when a assignment expired
    sendDeadlineNotification: (assignment_id, user_id, subject) => {
        return new Promise(async (resolve, reject) => {
            try{
                const result = await Notification.aggregate([
                    
                ])
                console.log(result)
            }catch (err) {
                console.error(`ERROR! Could not send expired asg ${groupId}: ${err}`);
                reject(err);
            }
        })
    },

}

module.exports = notificationModel;