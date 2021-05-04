const mongoose = require("mongoose");
const { Schema } = mongoose;

const { Question } = require("./questionModel");

// creating user object schema
const AssignmentSchema = new Schema({
    topic_id: {
        type: Schema.Types.ObjectId,
        required: "Topic ID is required"
    },
    topic_name: {
        type: String,
        required: "Topic Name is required"
    },
    score: {
        type: Number
    },
    time_taken: {
        type: Number
    },
    assigned_by: {
        type: Schema.Types.ObjectId,
        required: "Assigned By is required"
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date,
        min: Date.now
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    quiz_questions: [ Question ],
    num_of_questions: {
        type: Number,
        required: "Number of questions is required"
    },
    difficulty_portion: {
        easy: { type: Number, required: "Difficulty portion for easy questions is required" },
        medium: { type: Number, required: "Difficulty portion for medium questions is required" },
        hard: { type: Number, required: "Difficulty portion for hard questions is required" }
    }
});

const Assignment = mongoose.model("Assignment", AssignmentSchema);

const assignmentModel = {
    AssignmentSchema
}

module.exports = assignmentModel;