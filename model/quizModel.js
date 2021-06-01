/**
 * Quiz Object - schema and functions with Quiz table
 * 
 * Stores both quizzes assigned and self-assigned
 */
const mongoose = require("mongoose");
const { Schema } = mongoose;

const { Question } = require("./questionModel");

// creating user object schema
const QuizSchema = new Schema({
    skill_id: {
        type: Schema.Types.ObjectId,
        required: "Skill ID is required"
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
        type: Schema.Types.ObjectId,
        required: "Done By is required"
    },
    score: {
        type: Number
    },
    questions: [ Question ],
    num_of_qn: {
        type: Number,
        required: "Number of questions is required"
    },
    time_taken: {
        type: Number
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    // the following are only needed for assignments
    assigned_by: {
        type: Schema.Types.ObjectId,
        required: "Assigned By is required"
    },
    deadline: {
        type: Date,
        min: Date.now
    }
});

const Quiz = mongoose.model("Quiz", QuizSchema);

const quizModel = {
    QuizSchema
}

module.exports = quizModel;