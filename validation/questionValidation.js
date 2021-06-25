const { body, param, query, header, cookie } = require("express-validator");
const { errorHandler } = require("./errorHandler");

let attribute = {
    question_id: () => {
        return param("questionId")
            .notEmpty().withMessage("Question ID cannot be empty").bail()
            .isMongoId().withMessage("Question ID is not a valid ID")
    },
    skill_id: () => {
        return body("*.skill_id")
            .notEmpty().withMessage("Skill ID cannot be empty").bail()
            .isMongoId().withMessage("Skill ID is not a valid ID")
    },
    question_number: () => {
        return body("*.question_number")
            .notEmpty().withMessage("Question Number cannot be empty").bail()
            .isInt({ min: 1 }).withMessage("Question Number should be an integer").bail()
            .toInt()
    },
    question: () => {
        return body("*.question")
            .notEmpty().withMessage("Question cannot be empty").bail()
            .stripLow().trim().escape()
    },
    answer: () => {
        return body("*.answer")
            .notEmpty().withMessage("Answer cannot be empty").bail()
            .stripLow().trim().escape()
    },
    correct_answer: () => {
        return body("*.correct_answer")
            .notEmpty().withMessage("Correct answer cannot be empty").bail()
            .stripLow().trim().escape()
    },
    isCorrect: () => {
        return body("*.isCorrect")
            .notEmpty().withMessage("Correct flag cannot be empty").bail()
            .isBoolean().withMessage("Correct flag must be a boolean").bail()
            .toBoolean()
    },
    difficulty: () => {
        return body("*.difficulty")
            .notEmpty().withMessage("Difficulty cannot be empty").bail()
            .isIn(["easy", "medium", "difficult"]).withMessage("Invalid Difficulty").bail()
            .stripLow()
    }
}

exports.validate = (method) => {
    switch(method) {
        case "createQuestions": {
            return [
                param("quizId")
                    .notEmpty().withMessage("Quiz ID cannot be empty").bail()
                    .isMongoId().withMessage("Quiz ID is not a valid ID"),
                body()
                    .isArray().withMessage("Questions are not in array format"),
                attribute.skill_id(),
                attribute.question_number(),
                attribute.question(),
                attribute.answer(),
                attribute.correct_answer(),
                attribute.isCorrect(),
                attribute.difficulty(),
                errorHandler
            ]
        }
        case "questionId": {
            return [
                attribute.question_id(),
                errorHandler
            ]
        }
        case "quizId": {
            return [
                param("quizId")
                    .notEmpty().withMessage("Quiz ID cannot be empty").bail()
                    .isMongoId().withMessage("Quiz ID is not a valid ID"),
                errorHandler
            ]
        }
    }
}