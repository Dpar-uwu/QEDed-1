const { body, param, query, header, cookie } = require("express-validator");
const { errorHandler } = require("../validation/errorHandler");

// get topic attributes from level validation
const { attribute } = require("../validation/levelValidation");


exports.validate = (method) => {
    switch (method) {
        case "skillId": {
            return [
                attribute.skillId(),
                // catches error if body has extra unexpected parameters
                param()
                    .custom(param => {
                        const keys = ["skillId"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                errorHandler
            ]
        }
        case "createSkill": {
            return [
                attribute.topicId(),
                attribute.skill_code("skill_code"),
                attribute.skill_name("skill_name"),
                attribute.num_of_qn("num_of_qn"),
                attribute.percent_difficult("percent_difficulty"),
                attribute.duration("duration"),
                attribute.easy_values_min("easy_values.min"),
                attribute.easy_values_max("easy_values.max"),
                attribute.easy_min_max("easy_values"),
                attribute.medium_values_min("medium_values.min"),
                attribute.medium_values_max("medium_values.max"),
                attribute.medium_min_max("medium_values"),
                attribute.difficult_values_min("difficult_values.min"),
                attribute.difficult_values_max("difficult_values.max"),
                attribute.difficult_min_max("difficult_values"),

                param()
                    .custom(param => {
                        const keys = ["topicId"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                // catches error if skills array has extra unexpected parameters
                body()
                    .optional()
                    .custom(val => {
                        const skillKeys = ["skill_code", "skill_name", "num_of_qn", "percent_difficulty", "duration", "easy_values", "medium_values", "difficult_values"];
                        return Object.keys(val).every(key => skillKeys.includes(key));
                    }).withMessage("Some extra parameters are sent in one of the skill array(s)"),
                // catches error if easy_values in skills array has extra unexpected parameters
                body("easy_values")
                    .optional()
                    .custom(val => {
                        const numParamKeys = ["min", "max"];
                        return Object.keys(val).every(key => numParamKeys.includes(key));
                    }).withMessage("Some extra parameters are sent in one of the easy numerical values"),
                // catches error if medium_values in skills array has extra unexpected parameters
                body("medium_values")
                    .optional()
                    .custom(val => {
                        const numParamKeys = ["min", "max"];
                        return Object.keys(val).every(key => numParamKeys.includes(key));
                    }).withMessage("Some extra parameters are sent in one of the medium numerical values"),
                // catches error if difficult_values in skills array has extra unexpected parameters
                body("difficult_values")
                    .optional()
                    .custom(val => {
                        const numParamKeys = ["min", "max"];
                        return Object.keys(val).every(key => numParamKeys.includes(key));
                    }).withMessage("Some extra parameters are sent in one of the difficult numerical values"),
                errorHandler
            ]
        }
        case "updateSkill": {
            return [
                attribute.skillId(),
                attribute.skill_code("skill_code").optional(),
                attribute.skill_name("skill_name").optional(),
                attribute.num_of_qn("num_of_qn").optional(),
                attribute.percent_difficult("percent_difficulty").optional(),
                attribute.duration("duration").optional(),
                attribute.easy_values_min("easy_values.min").optional(),
                attribute.easy_values_max("easy_values.max").optional(),
                attribute.easy_min_max("easy_values").optional(),
                attribute.medium_values_min("medium_values.min").optional(),
                attribute.medium_values_max("medium_values.max").optional(),
                attribute.medium_min_max("medium_values").optional(),
                attribute.difficult_values_min("difficult_values.min").optional(),
                attribute.difficult_values_max("difficult_values.max").optional(),
                attribute.difficult_min_max("difficult_values").optional(),

                // catches error if params has extra unexpected parameters
                param()
                    .custom(param => {
                        const keys = ["skillId"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                // catches error if body has extra unexpected parameters
                body()
                    .optional()
                    .custom(val => {
                        const skillKeys = ["skill_code", "skill_name", "num_of_qn", "percent_difficulty", "duration", "easy_values", "medium_values", "difficult_values"];
                        return Object.keys(val).every(key => skillKeys.includes(key));
                    }).withMessage("Some extra parameters are sent"),
                body("easy_values")
                    .optional()
                    .custom(val => {
                        const numParamKeys = ["min", "max"];
                        return Object.keys(val).every(key => numParamKeys.includes(key));
                    }).withMessage("Some extra parameters are sent in the easy numerical values"),
                body("medium_values")
                    .optional()
                    .custom(val => {
                        const numParamKeys = ["min", "max"];
                        return Object.keys(val).every(key => numParamKeys.includes(key));
                    }).withMessage("Some extra parameters are sent in the medium numerical values"),
                body("difficult_values")
                    .optional()
                    .custom(val => {
                        const numParamKeys = ["min", "max"];
                        return Object.keys(val).every(key => numParamKeys.includes(key));
                    }).withMessage("Some extra parameters are sent in the difficult numerical values"),
                errorHandler
            ]
        }
    }
}