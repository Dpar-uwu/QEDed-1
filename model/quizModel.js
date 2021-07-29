/**
 * Quiz Object - schema and functions with Quiz table
 * 
 * Stores both quizzes assigned and self-assigned
 */
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId, } = mongoose.Types;

const { QuestionSchema } = require("./questionModel");
const { LevelSchema } = require("./levelModel");

// creating user object schema
const QuizSchema = new Schema({
    skill_id: {
        type: ObjectId,
        required: "Skill ID is required"
    },
    level: {
        type: Number,
        required: "Level is required"
    },
    skill_name: {
        type: String,
        required: "Skill Name required"
    },
    topic_name: {
        type: String,
        required: "Topic Name is required"
    },
    done_by: {
        type: ObjectId,
        required: "Done By is required"
    },
    score: {
        easy: {
            type: Number
        },
        medium: {
            type: Number
        },
        difficult: {
            type: Number
        },
        total: {
            type: Number
        }
    },
    questions: {
        type: [QuestionSchema]
    },
    num_of_qn: {
        type: Number,
        required: "Number of questions is required"
    },
    percent_difficulty: {
        type: String,
        required: "Percentage difficulty required for easy, medium and difficult"
    },
    time_taken: {
        type: Number
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    // the following are only needed for assignments
    assigned_by: {
        type: ObjectId
    },
    group_id: {
        type: ObjectId
    },
    deadline: {
        type: Date
    }
});
// skill_id, skill_name, topic_name, done_by, 
// score, questions, num_of_qn, percent_difficulty, time_taken, 
// isCompleted, created_at, group_id, assigned_by, deadline

const Quiz = mongoose.model("Quiz", QuizSchema);
const Level = mongoose.model("Level", LevelSchema);

const quizModel = {
    QuizSchema,
    /**
     * Quiz Functions
     */
    // get all quizzes
    getAllQuizzes: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Quiz.find().select("-__v");
                if (!result) throw "UNEXPECTED_ERROR";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not get all quizzes:", err);
                reject(err);
            }
        })
    },
    getQuizById: (quizId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Quiz.findOne({ "_id": quizId }).select("-__v");
                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not get quiz by id:", err);
                reject(err);
            }
        })
    },
    // view assignment >> getAssignmentsByUser
    // TODO: Make sure assignments and quizzes can be differentiated
    getQuizByUserId: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Quiz.find({ "done_by": ObjectId(userId) }).select("-__v");
                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not get quizzes by user:", err);
                reject(err);
            }
        })
    },
    getQuizByFilter: (userId, level, topic_name) => {
        return new Promise(async (resolve, reject) => {
            try {
                let match_opt = {"done_by": ObjectId(userId)};
                let search = "level";

                if(level != undefined && level != ""){match_opt.level = level; search = "topic_name";}
                if(topic_name != undefined && topic_name != "") {match_opt.topic_name = topic_name; search = "skill_name";}

                const result = await Quiz.find(match_opt).distinct(search);
                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not get quizzes by: ", err);
                reject(err);
            }
        })
    },
    // adding quiz
    createQuiz: (addedFields) => {
        return new Promise(async (resolve, reject) => {
            try {
                const newQuiz = new Quiz(addedFields);
                const result = await newQuiz.save();

                if (!result) throw "UNEXPECTED_ERROR";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not add quiz", err);
                reject(err);
            }
        })
    },
    // updating quiz
    updateQuizById: (quizId, changedFields) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Quiz.findByIdAndUpdate(ObjectId(quizId), changedFields);

                if (!result) throw "NOT_FOUND";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not update quiz with id ${quizId}: ${err}`);
                reject(err);
            }
        })
    },
    //delete quiz by id
    deleteQuizById: (quizId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Quiz.findByIdAndDelete(ObjectId(quizId));

                if (!result) throw "NOT_FOUND";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not delete quiz with id ${quizId}: ${err}`);
                reject(err);
            }
        })
    },
    // TODO: View GROUP leaderboard
    // view leaderboard
    // The leaderboard is ranked in the following order with the following displayed
    // regardless of grade or topic/skill:
    // - Percentage total
    // - Number of quizzes sat for
    // - Average Time taken
    getGlobalLeaderboard: (topLimit = 50) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Quiz.aggregate([
                    {
                        $group: {
                            "_id": "$done_by",
                            "average_score": { $avg: "$score.total" },
                            "num_of_quiz": { $sum: 1 },
                            "average_time_taken": { $avg: "$time_taken" }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id",
                            foreignField: "_id",//<field from the documents of the "from" collection>
                            as: "user" //<output array field>
                        }
                    },
                    {
                        //ensure only students are in leaderboard
                        $match: { "user.role": "student" }
                    },
                    {
                        $sort: {
                            "average_score": -1, //descending
                            "num_of_quiz": -1, // descending
                            "average_time_taken": 1 // ascending 
                        }
                    },
                    {
                        $project: {
                            "user.password": 0,
                            "user.__v": 0
                        }
                    }
                ]).limit(topLimit);

                // transform result data
                result.forEach(row => {
                    row.first_name = row.user[0].first_name;
                    row.last_name = row.user[0].last_name;
                    row.school = row.user[0].school;
                    row.grade = row.user[0].grade;
                    delete row.user;
                })

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not get top students gloabally: ${err}`);
                reject(err);
            }
        })
    },
    // TODO: get benchmark
    // 5 bar graphs should appear:
    // - total percentage score
    // - time taken
    // - the percentage scores for easy, medium, difficult questions
    // Each graph should have 3 categories:
    // - last quiz
    // - global average
    // - recent 10 quizzes
    getGlobalBenchmark: (userId, level, topic, skill) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = {};
                let recent_match_opt = {
                    "done_by": ObjectId(userId), //get all from user
                }

                if(level != undefined && level != "") recent_match_opt.level = parseInt(level);
                if(topic != undefined && topic != "") recent_match_opt.topic_name = topic;
                if(skill != undefined && skill != "") recent_match_opt.skill_name = skill;

                var current = await Quiz.find(recent_match_opt).sort({_id: -1}).limit(1);
                if(current.length > 0){
                    current = current[0], result.current = {};
                    recent_match_opt._id = { $ne: ObjectId(current._id) }
                    result.current.easy_average_score = current.score.easy;
                    result.current.medium_average_score = current.score.medium;
                    result.current.difficult_average_score = current.score.difficult;
                    result.current.total_average_score = current.score.total;
                    result.current.average_time_taken = current.time_taken;
                }
                  
                // recent 10
                const recent = await Quiz.aggregate([
                    {
                        $match: recent_match_opt
                    },
                    {
                        $group: {
                            "_id": null,
                            "easy_average_score": { $avg: "$score.easy" },
                            "medium_average_score": { $avg: "$score.medium" },
                            "difficult_average_score": { $avg: "$score.difficult" },
                            "total_average_score": { $avg: "$score.total" },
                            "average_time_taken": { $avg: "$time_taken" }
                        }
                    },
                    { $project: { _id: 0 } }
                ]).limit(10);

                recent_match_opt.done_by = { $ne: ObjectId(userId) };
                delete recent_match_opt['_id'];

                console.log(recent_match_opt)
                // global except user
                const global = await Quiz.aggregate([
                    {
                        $match: recent_match_opt
                    },
                    {
                        $group: {
                            "_id": null,
                            "easy_average_score": { $avg: "$score.easy" },
                            "medium_average_score": { $avg: "$score.medium" },
                            "difficult_average_score": { $avg: "$score.difficult" },
                            "total_average_score": { $avg: "$score.total" },
                            "average_time_taken": { $avg: "$time_taken" }
                        }
                    },
                    { $project: { _id: 0 } }
                ]);

                result.recent = recent[0];
                result.global = global[0];                

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not get benchmark: ${err}`);
                reject(err);
            }
        })
    },
    // recommend quiz skill by lowest average score
    recommendQuiz: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const weakest3 = await Quiz.aggregate([
                    {
                        $match: { "done_by": ObjectId(userId) }
                    },
                    {
                        // group quizzes by skillId
                        $group: {
                            "_id": "$skill_id",
                            "average_score": { $avg: "$score.total" },
                            "skill_name": { $last: "$skill_name" },
                            "num_of_quiz": { $sum: 1 },
                            "average_time_taken": { $avg: "$time_taken" }
                        }
                    },
                    {
                        $sort: {
                            "average_score": 1, // arrange average score in ascending order
                            "num_of_quiz": -1, // descending
                            "average_time_taken": 1 // ascending
                        }
                    },
                    {
                        $project: {
                            "num_of_quiz": 0,
                            "average_time_taken": 0
                        }
                    }
                ]).limit(3);


                const newSkills = await Level.aggregate([
                    { $unwind: '$topics' },
                    { $unwind: '$topics.skills' },
                    {
                        $project:
                        {
                            "_id": 0, "levelId": "$_id", "level": 1,
                            "topicId": "$topics._id", "topic_name": "$topics.topic_name",
                            "skillId": "$topics.skills._id",
                            "skill_name": "$topics.skills.skill_name"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "level",
                            foreignField: "grade",//<field from the documents of the "from" collection>
                            as: "user" //<output array field>
                        }
                    },
                    { $match: { "user._id": ObjectId(userId) } },
                    {
                        $sort: {
                            "skillId": -1,
                        }
                    },
                    {
                        $project: {
                            "user": 0
                        }
                    },
                ]).limit(3);

                console.log("SUCCESS! Result", weakest3, newSkills);
                resolve({ weakest3, newSkills });
            } catch (err) {
                console.error(`ERROR! Could not get recommended quizzes`);
                reject(err);
            }
        })
    },
    getWeeklyProgress: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                var d = new Date();
                d.setMonth(d.getMonth() - 1);// Set it to one month ago
                d.setHours(0, 0, 0, 0);
                
                const result = await Quiz.aggregate([
                    {
                        $match: { "done_by": ObjectId(userId) }
                    },
                    {
                        $match: {
                            "created_at": {$gt: d},
                        }
                    },
                    {
                        $group: {
                            // _id: { $week: '$created_at' }, 
                            _id: {$dateToString: { format: "%Y-%m-%d", date: "$created_at" }},
                            "average_score": { $avg: "$score.total" },
                            "num_of_quiz": { $sum: 1 },
                            "average_time_taken": { $avg: "$time_taken" }
                        }
                    }
                ]);

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not get weekly progress`);
                reject(err);
            }
        })
    },

    /**
     * Question Functions
     */
    // get question by id
    getQuestionById: (questionId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Quiz.aggregate([
                    { $unwind: '$questions' },
                    { $match: { "questions._id": ObjectId(questionId) } },
                    {
                        $project: {
                            _id: 0,
                            "quizId": "$_id",
                            "question": "$questions"
                        }
                    }
                ]);

                if (!result || result.length == 0) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result[0]); //result will be an array with only 1 object
            } catch (err) {
                console.error(`ERROR! Could not get question with id ${questionId}: ${err}`);
                reject(err);
            }
        })
    },
    createQuestionsByQuizId: (quizId, questions) => {
        return new Promise(async (resolve, reject) => {
            try {
                const quiz = await Quiz.findOne({ _id: quizId });

                if (!quiz) throw "NOT_FOUND";

                // append new topic to db array and save to db
                questions.forEach(question => {
                    quiz.questions.push(question);
                })

                const result = quiz.save();

                console.log("SUCCESS! Result", result);
                resolve(quiz);
            } catch (err) {
                console.error(`ERROR! Could not add questions with quiz id ${quizId}: ${err}`);
                reject(err);
            }
        })
    },
    deleteQuestionsByQuizId: (quizId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const quiz = await Quiz.findOne({ "_id": quizId });

                if (!quiz) throw "NOT_FOUND";

                quiz.pull(quiz.questions); // delete questions array from quiz
                const result = await quiz.save(); // save changes

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not delete questions with quiz id ${quizId}: ${err}`);
                reject(err);
            }
        })
    },
    populateQuizzes: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const addQuizzes = require('../datasheets/quiz.json');
                const result = await Quiz.insertMany(addQuizzes);

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not populate users to its default: ${err}`);
                reject(err);
            }
        })
    }
}

module.exports = quizModel;