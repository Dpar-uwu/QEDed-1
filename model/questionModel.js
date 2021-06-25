const mongoose = require("mongoose");
const { Schema } = mongoose;

// creating user object schema
const QuestionSchema = new Schema({
    skill_id: {
        type: String,
        required: "Skill ID required"
    },
    question_number: {
        type: Number,
        min: 1,
        required: "Question Number is required"
    },
    question: {
        type: String,
        required: "Question is required"
    },
    answer: {
        type: String
    },
    correct_answer: {
        type: String
    },
    isCorrect: {
        type: Boolean
    },
    difficulty: {
        type: String,
        required: "Difficulty required",
        enum: ["easy", "medium", "difficult"]
    }
});

const Question = mongoose.model("Question", QuestionSchema)

const questionModel = {
    QuestionSchema,
    /**
     * Question Functions
     */
    // get all questions
}

module.exports = questionModel;