const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;
const { GroupSchema } = require("./groupModel");

const AssignmentSchema = new Schema({
    title: {
        type: String,
        required: "Title required"
    },
    level_id: {
        type: ObjectId,
        required: "Level Id required"
    },
    topic_id: {
        type: ObjectId,
        required: "Topic Id required"
    },
    skill_id: {
        type: ObjectId,
        required: "Skill Id required"
    },
    assigned_by: {
        type: ObjectId,
        required: "Assigned by required"
    },
    group_id: {
        type: ObjectId,
        required: "Group ID required"
    },
    deadline: {
        type: Date,
        required: "Deadline required"
    }
});

const Assignment = mongoose.model("Assignment", AssignmentSchema);
const Group = mongoose.model("Group", GroupSchema);

const assignmentModel = {
    AssignmentSchema,
    // get assignment by user 
    getAsgByUserId: (userId) => {
        return new Promise(async (resolve, reject) => {
            try{
                // get the group that the user is in 
                const group = await Group.find({ "members.user_id": ObjectId(userId) }).select('_id');
                console.log(group)
                if (!group) throw "NOT_FOUND";

                // get all assignment by selected grp 
                const result = await Assignment.find({ "group_id": group });
                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                console.log(result.length);
                resolve(result[0]);
            }catch (err) {
                console.error(`ERROR! Could not get assignment by user id: ${err}`);
                reject(err);
            }
        })
    },

    // get assignment by grp
    getAsgByGrpId: (groupId) => {
        return new Promise(async (resolve, reject) => {
            try{
                const result = await Assignment.find({ "group_id": ObjectId(groupId) }).select('-__v');
                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                console.log(result.length);
                resolve(result[0]);
            }catch (err) {
                console.error("ERROR! Could not get asg by group id:", err);
                reject(err);
            }
        })
    },

    // get assignment by id 
    getAsgById: (assignmentId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Assignment.findOne({ "_id": assignmentId }).select("-__v");
                console.log(result)
                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not get assignment by id:", err);
                reject(err);
            }
        })
    },

    // get outstanding assignment 
    // its not save in the quiz page
    //howwwwww
    // getUndoneAssignmentByUserId: (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         try{
    //             // get the group that the user is in 
    //             const group = await Group.find({ "members.user_id": ObjectId(userId) }).select('_id');
    //             console.log(group)
    //             if (!group) throw "NOT_FOUND";

    //             // get all assignment by grp 
    //             const assignment = await Assignment.find({ "group_id": group }).select('_id');
    //             if (!result) throw "NOT_FOUND";

    //             const result = await Assignment.aggregate([
    //                 {
    //                     $lookup: {
    //                         from: "quizzes",
    //                         localField: "_id",
    //                         foreignField: "assignment_id",
    //                         as: "quiz"
    //                     }
    //                 },
    //                 {
    //                     $match: { "quiz.assignment_id": assignment }
    //                 },
    //                 {
    //                     $match: { "quiz.isCompleted": false }
    //                 }
    //             ])

    //             console.log("SUCESS! Result", result);
    //             resolve(result);
    //         }catch (err) {
    //             console.error(`ERROR! Could not get undone assignment by user id: ${err}`);
    //             reject(err);
    //         }
    //     })
    // },

    // create assignment 
    createAsgbyGrpId: (title, level_id, topic_id, skill_id, assigned_by, group_id, deadline) => {
        return new Promise(async (resolve, reject) => {
            try {
                const newAsg = new Assignment({ title, level_id, topic_id, skill_id, assigned_by, group_id, deadline });
                const result = await newAsg.save();

                if (!result) throw "UNEXPECTED_ERROR";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not add assignment", err);
                reject(err);
            }
        })
    },
};

module.exports = assignmentModel;
