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
            try {
                // get the group that the user is in 
                // const group = await Group.find({ "members.user_id": ObjectId(userId) }).select('_id');
                // if (!group) throw "NOT_FOUND";

                // get all assignment by selected grp 
                // const result = await Assignment.find({ "group_id": group });
                const result = await Assignment.aggregate([
                    { // join to users to get name of assigned by
                        $lookup: {
                            from: "groups",
                            as: "group",
                            localField: "group_id",
                            foreignField: "_id"
                        }
                    },
                    {
                        $match: { "group.members.user_id": ObjectId(userId) }
                    },
                    {
                        $addFields: {
                            "group_name": {
                                $first: "$group.group_name"
                            }
                        }
                    },
                    {
                        $project: { "group": 0 }
                    },
                    { // join to users to get name of assigned by
                        $lookup: {
                            from: "users",
                            as: "user",
                            localField: "assigned_by",
                            foreignField: "_id"
                        }
                    },
                    {
                        $addFields: {
                            assigned_by_name: {
                                $first: {
                                    $map: {
                                        input: "$user",
                                        as: "user",
                                        in: {
                                            $concat:
                                                ["$$user.first_name", " ", "$$user.last_name"]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: { "user": 0 }
                    },
                    { // join to level to get skill name
                        $lookup: {
                            from: "levels",
                            as: "level",
                            localField: "skill_id",
                            foreignField: "topics.skills._id"
                        }
                    },
                    {
                        $addFields: {
                            topic: {
                                $first: {
                                    $filter: {
                                        input: { $first: "$level.topics" },
                                        as: "topics",
                                        cond: {
                                            "$eq": ["$$topics._id", "$topic_id"]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            skill: {
                                $first: {
                                    $filter: {
                                        input: "$topic.skills",
                                        as: "skill",
                                        cond: {
                                            "$eq": ["$$skill._id", "$skill_id"]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            skill_name: "$skill.skill_name"
                        }
                    },
                    {
                        $project: { level: 0, topic: 0, skill: 0 }
                    },
                    {
                        $sort: { "deadline": 1 }
                    }
                ]);
                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not get assignment by user id: ${err}`);
                reject(err);
            }
        })
    },

    // get assignment by grp
    getAsgByGrpId: (groupId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // const result = await Assignment.find({ "group_id": ObjectId(groupId) }).select('-__v');
                let result = await Assignment.aggregate([
                    {
                        $match: {
                            group_id: ObjectId(groupId)
                        }
                    },
                    { // join to users to get name of assigned by
                        $lookup: {
                            from: "users",
                            as: "user",
                            localField: "assigned_by",
                            foreignField: "_id"
                        }
                    },
                    {
                        $addFields: {
                            assigned_by_name: {
                                $first: {
                                    $map: {
                                        input: "$user",
                                        as: "user",
                                        in: {
                                            $concat:
                                                ["$$user.first_name", " ", "$$user.last_name"]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: { "user": 0 }
                    },
                    { // join to level to get skill name
                        $lookup: {
                            from: "levels",
                            as: "level",
                            localField: "skill_id",
                            foreignField: "topics.skills._id"
                        }
                    },
                    {
                        $addFields: {
                            topic: {
                                $first: {
                                    $filter: {
                                        input: { $first: "$level.topics" },
                                        as: "topics",
                                        cond: {
                                            "$eq": ["$$topics._id", "$topic_id"]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            skill: {
                                $first: {
                                    $filter: {
                                        input: "$topic.skills",
                                        as: "skill",
                                        cond: {
                                            "$eq": ["$$skill._id", "$skill_id"]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            skill_name: "$skill.skill_name"
                        }
                    },
                    {
                        $project: { level: 0, topic: 0, skill: 0 }
                    },
                    { // join to groups to get group name
                        $lookup: {
                            from: "groups",
                            as: "group",
                            localField: "group_id",
                            foreignField: "_id"
                        }
                    },
                    {
                        $addFields: {
                            group_name: { $first: "$group.group_name" }
                        }
                    },
                    {
                        $project: { group: 0 }
                    },
                    {
                        $sort: { deadline: 1 }
                    },
                    {
                        $group: {
                            _id: "$group_name",
                            assignments: { $push: "$$ROOT" }
                        }
                    },
                    {
                        $project: {
                            group_name: "$_id",
                            assignments: 1,

                            _id: 0
                        }
                    },
                    {
                        $project: { "assignments.group_name": 0 }
                    }
                ]);


                if (!result[0]) {
                    result = Group.findOne(ObjectId(groupId)).select("group_name");
                    if (!result) throw "NOT_FOUND";

                    console.log("SUCCESS! Result", result);
                    resolve(result);
                }
                else {
                    console.log("SUCCESS! Result", result[0]);
                    resolve(result[0]);
                }
            } catch (err) {
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
