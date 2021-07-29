const { body, param, query, header, cookie } = require("express-validator");
const { errorHandler } = require("../validation/errorHandler");

let attribute = {
    quiz_id: () => {
        return param("quizId")
            .notEmpty().withMessage("Quiz ID cannot be empty").bail()
            .isMongoId().withMessage("Quiz ID given is not a valid ID")
    },
    skill_id: () => {
        return body("skill_id")
        .notEmpty().withMessage("Skill ID cannot be empty").bail()
        .isMongoId().withMessage("Skill ID given is not a valid ID")
    },
    level: () => {
        return body("level")
            .notEmpty().withMessage("Level cannot be empty").bail()
            .isInt().withMessage("Level required, must be an integer").bail()
            .stripLow()
            .toInt()
    },
    skill_name: () => {
        return body("skill_name")
            .notEmpty().withMessage("Skill Name cannot be empty").bail()
            .matches(/^(?=.*[a-zA-Z])([a-zA-Z0-9_\-,' ]+)$/).withMessage("Skill name should contain letters, numbers, _, -, commas and whitespaces only").bail()
            .stripLow().trim()
    },
    topic_name: () => {
        return body("topic_name")
            .notEmpty().withMessage("Topic Name cannot be empty").bail()
            .matches(/^(?=.*[a-zA-Z])([a-zA-Z0-9_\-,' ]+)$/).withMessage("Topic name should contain letters, numbers, _, -, commas and whitespaces only").bail()
            .stripLow().trim()
    },
    done_by: () => {
        return body("done_by")
            .notEmpty().withMessage("Done By cannot be empty").bail()
            .isMongoId().withMessage("User ID given is not a valid ID")
    },
    // quiz > score
    score_easy: () => {
        return body("score.easy")
            .notEmpty().withMessage("Score for easy cannot be empty").bail()
            .isNumeric({ min: 1 }).withMessage("Score for easy should be a float or integer")
    },
    score_medium: () => {
        return body("score.medium")
            .notEmpty().withMessage("Score for medium cannot be empty").bail()
            .isNumeric({ min: 1 }).withMessage("Score for medium should be a float or integer")
    },
    score_difficult: () => {
        return body("score.difficult")
            .notEmpty().withMessage("Score for difficult cannot be empty").bail()
            .isNumeric({ min: 1 }).withMessage("Score for difficult should be a float or integer")
    },
    score_total: () => {
        return body("score.total")
            .notEmpty().withMessage("Total score cannot be empty").bail()
            .isNumeric({ min: 1 }).withMessage("Total score should be a float or integer")
    },

    questions: () => {
        return body("questions")
            .isArray().withMessage("Questions should be in array format")
            .toArray()
    },
    num_of_qn: () => {
        return body("num_of_qn")
            .notEmpty().withMessage("Number of questions cannot be empty").bail()
            .isInt({ min:1 }).withMessage("Number of question should be an integer")
            .toInt()
    },
    percent_difficulty: () => {
        return body("percent_difficulty")
            .notEmpty().withMessage("Percentage Difficulty cannot be empty").bail()
            .matches(/^\d{1}0-\d{1}0-\d{1}0$/).withMessage("Percent difficulty should contain numbers in multiples of 10 separated by - e.g. 20-50-30").bail()
            .stripLow()
    },
    time_taken: () => {
        return body("time_taken")
            .notEmpty().withMessage("Time taken cannot be empty").bail()
            .isFloat().withMessage("Time taken should be a float").bail()
            .toFloat()
    },
    isCompleted: () => {
        return body("isCompleted")
            .notEmpty().withMessage("Completed flag cannot be empty").bail()
            .isBoolean().withMessage("Completed flag should be a boolean").bail()
            .toBoolean()
    },

    // only for assignments
    assigned_by: () => {
        return body("assigned_by")
            .notEmpty().withMessage("Assigned By cannot be empty").bail()
            .isMongoId().withMessage("Assigned By is not a valid ID");
    },
    group_id: () => {
        return body("group_id")
            .notEmpty().withMessage("Group ID cannot be empty").bail()
            .isMongoId().withMessage("Group ID is not a valid ID");
    },
    deadline: () => {
        return body("deadline")
            .notEmpty().withMessage("Deadline cannot be empty").bail()
            .isISO8601({ strict: true }).withMessage("Deadline should be a proper ISO 8601 date").bail()
            .toDate()
    }
};

exports.validate = (method) => {
    switch(method) {
        case "createQuiz": {
            return [
                attribute.skill_id(),
                attribute.level(),
                attribute.skill_name(),
                attribute.topic_name(),
                attribute.done_by(),
                attribute.score_easy().optional(),
                attribute.score_medium().optional(),
                attribute.score_difficult().optional(),
                attribute.score_total().optional(),
                attribute.questions().optional(),
                attribute.num_of_qn(),
                attribute.percent_difficulty(),
                attribute.time_taken().optional(),
                attribute.isCompleted(),
                attribute.assigned_by().optional(),
                attribute.group_id().optional(),
                attribute.deadline().optional(),
                errorHandler
            ]
        }
        case "quizId": {
            return [
                attribute.quiz_id(),
                errorHandler
            ]
        }
        case "updateQuiz": {
            return [
                attribute.quiz_id().optional(),
                attribute.skill_id().optional(),
                attribute.level().optional(),
                attribute.skill_name().optional(),
                attribute.topic_name().optional(),
                attribute.done_by().optional(),
                attribute.score_easy().optional(),
                attribute.score_medium().optional(),
                attribute.score_difficult().optional(),
                attribute.score_total().optional(),
                attribute.questions().optional(),
                attribute.num_of_qn().optional(),
                attribute.percent_difficulty(),
                attribute.time_taken().optional(),
                attribute.isCompleted().optional(),
                attribute.assigned_by().optional(),
                attribute.deadline().optional(),
                errorHandler
            ]
        }
        case "userId": {
            return [
                query("userId")
                    .notEmpty().withMessage("User ID cannot be empty").bail()
                    .isMongoId().withMessage("User ID given is not a valid ID"),
                errorHandler
            ]
        }
        case "scope": {
            return [
                query("scope")
                    .optional()
                    .if(query("scope").isEmpty())
                    .not().isMongoId().withMessage("Group ID given is not a valid ID"),
                errorHandler
            ]
        }
        case "benchmark": {
            return [
                query("user")
                    .notEmpty().withMessage("User ID cannot be empty").bail()
                    .isMongoId().withMessage("User ID given is not a valid ID"),
                query('level')
                    .optional()
                    .if(query('level').isEmpty())
                    .not().isInt().withMessage("Level is not int")
                    .toInt(),
                query('topic_name')
                    .optional()
                    .if(query('topic_name').isEmpty())
                    .not().matches(/^(?=.*[a-zA-Z])([a-zA-Z0-9_\-,' ]+)$/).withMessage("Topic name should contain letters, numbers, _, -, commas and whitespaces only"),
                query('skill_name')
                    .optional()
                    .if(query('skill_name').isEmpty())
                    .not().matches(/^(?=.*[a-zA-Z])([a-zA-Z0-9_\-,' ]+)$/).withMessage("Skill name should contain letters, numbers, _, -, commas and whitespaces only"),          errorHandler
            ]
        }
    }
}