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
                        $lookup: {
                            from: "quizzes",
                            localField: "_id",
                            foreignField: "assignment_id",
                            as: "quiz"
                        }
                    },
                    {
                        $addFields: {
                            "quiz": {
                                $first: {
                                    $filter: {
                                        input: "$quiz",
                                        as: "quiz",
                                        cond: {
                                            "$eq": ["$$quiz.done_by", ObjectId(userId)]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            completed_quiz: {
                                $cond: {// check if user has completed assignmnent
                                    if: { $eq: ["$quiz.done_by", ObjectId(userId)] },
                                    then: "$quiz._id",
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            "quiz": 0
                        }
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
    getAsgByGrpId: (groupId, userId) => {
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
                        $lookup: {
                            from: "quizzes",
                            localField: "_id",
                            foreignField: "assignment_id",
                            as: "quiz"
                        }
                    },
                    {
                        $addFields: {
                            "quiz": {
                                $first: {
                                    $filter: {
                                        input: "$quiz",
                                        as: "quiz",
                                        cond: {
                                            "$eq": ["$$quiz.done_by", ObjectId(userId)]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            completed_quiz: {
                                $cond: {// check if user has completed assignmnent
                                    if: { $eq: ["$quiz.done_by", ObjectId(userId)] },
                                    then: "$quiz._id",
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            "quiz": 0
                        }
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
                    },
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

    
    getAllAsgProgressByGrpId: (group_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Group.aggregate([
                    { // select group that matches group id
                        $match: {
                            _id: ObjectId(group_id)
                        }
                    },
                    {
                        $project: { posts: 0 }
                    },
                    { // unwind members array to become objects
                        $unwind: {
                            path: "$members"
                        },
                    },
                    { // join users collection to members using id
                        $lookup: {
                            from: "users",
                            localField: "members.user_id",
                            foreignField: "_id",
                            as: "user_details"
                        }
                    },
                    { // transform array to object
                        $addFields: { 
                            user_details: { $first: "$user_details" }
                        }
                    },
                    { // combine existing members object with joined user details
                        $addFields: {
                            "members.name": { $concat: ["$user_details.first_name", " ", "$user_details.last_name"] },
                            "members.role": "$user_details.role",
                            "members.grade": "$user_details.grade"
                        }
                    },
                    {
                        $match: {
                            "members.role": "student"
                        }
                    },
                    {
                        $project: {
                            user_details: 0,
                            "members._id": 0,
                            "members.role": 0
                        }
                    },
                    {   // members left outer join quizzes
                        $lookup: {
                            from: "quizzes",
                            localField: "members.user_id",
                            foreignField: "done_by",
                            as: "quiz"
                        }
                    },
                    {
                        $project: {
                            "quiz.questions": 0,
                            "quiz.done_by": 0,
                            "quiz.level": 0,
                            "quiz.skill_id": 0,
                            "quiz.skill_name": 0,
                            "quiz.topic_name": 0,
                        }
                    },

                    {
                        $lookup: { // get only quizzes that are assigned using join
                            from: "assignments",
                            localField: "_id",
                            foreignField: "group_id",
                            as: "assignment"
                        }
                    },
                    {
                        $unwind: {
                            path: "$assignment",
                            // preserveNullAndEmptyArrays: true
                        },
                    },

                    { // join member's quizzes to grp assignments to check if assignm completed
                        $addFields: {
                            completed: {
                                $last: {
                                    $filter: {
                                        input: "$quiz",
                                        as: "quiz",
                                        cond: {
                                            "$eq": ["$$quiz.assignment_id", "$assignment._id"]
                                        }
                                    }
                                }
                            }
                        }
                    },

                    {
                        $addFields: {
                            member_assignment: {
                                $mergeObjects: [ "$members", "$completed" ]
                            },
                        }
                    },
                    {
                        $project: {
                            quiz: 0,
                            completed: 0,
                            members: 0
                        }
                    },
                    {
                        $group: {
                            _id: "$assignment._id",
                            group_name: { $first: "$group_name" },
                            member_assignment: { $push: "$member_assignment" },
                            title: { $first: "$assignment.title" },
                            level_id: { $first: "$assignment.level_id" },
                            topic_id: { $first: "$assignment.topic_id" },
                            skill_id: { $first: "$assignment.skill_id" },
                            assigned_by: { $first: "$assignment.assigned_by" },
                            group_id: { $first: "$assignment.group_id" },
                            deadline: { $first: "$assignment.deadline" },
                            // completed: { $push: "$completed" },
                        }
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
                            skill_name: "$skill.skill_name",
                            topic_name: "$topic.topic_name",
                            level_num: { $first: "$level.level" }
                        }
                    },
                    {
                        $project: { level: 0, topic: 0, skill: 0 }
                    },
                    { // sort deadline by ascending order
                        $sort: {
                            deadline: 1
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

                ]);

                if(result.length < 1) {
                    let empty = await Group.findOne({ _id: ObjectId(group_id)}).select("group_name");
                    console.log("SUCCESS! Result", empty)
                    resolve(empty);
                }
                else {
                    console.log("SUCCESS! Result", result[0])
                    resolve(result[0]);
                }
            } catch(err) {
                console.error(`ERROR! Could not get assignment progress by id ${group_id}: ${err}`);
                reject(err);
            }
        })
    },


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
