const { body, param, query, header, cookie } = require("express-validator");
const { errorHandler } = require("../validation/errorHandler");

// get topic attributes from level validation
const { attribute } = require("../validation/levelValidation");


exports.validate = (method) => {
    switch(method) {
        case "topicId": {
            return [
                attribute.topicId(),
                // catches error if body has extra unexpected parameters
                param()
                    .custom(param => {
                        const keys = ["topicId"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                errorHandler
            ]
        }
        case "createTopic": {
            return [
                attribute.levelId(),
                attribute.topic_name("topic_name"),
                attribute.skills("skills"),
                attribute.skill_code("skills.*.skill_code"),
                attribute.skill_name("skills.*.skill_name"),
                attribute.num_of_qn("skills.*.num_of_qn"),
                attribute.percent_difficult("skills.*.percent_difficulty"),
                attribute.duration("skills.*.duration"),
                attribute.easy_values_min("skills.*.easy_values.min"),
                attribute.easy_values_max("skills.*.easy_values.max"),
                attribute.easy_min_max("skills.*.easy_values"),
                attribute.medium_values_min("skills.*.medium_values.min"),
                attribute.medium_values_max("skills.*.medium_values.max"),
                attribute.medium_min_max("skills.*.medium_values"),
                attribute.difficult_values_min("skills.*.difficult_values.min"),
                attribute.difficult_values_max("skills.*.difficult_values.max"),
                attribute.difficult_min_max("skills.*.difficult_values"),
                param()
                    .custom(param => {
                        const keys = ["levelId"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                // catches error if body has extra unexpected parameters
                body()
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const topicKeys = ["topic_name", "skills"];
                        Object.keys(val).forEach(property => {
                            if (!topicKeys.includes(property)) {
                                noExtra = false;
                                return;
                            }
                        });
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in the topics array"),
                body("skills")
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const skillKeys = ["skill_code", "skill_name", "num_of_qn", "percent_difficulty", "duration", "easy_values", "medium_values", "difficult_values"];
                        val.forEach(topic => {
                            Object.keys(topic).forEach(property => {
                                if (!skillKeys.includes(property)) {
                                    noExtra = false;
                                    return;
                                }
                            })
                        })
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in one of the skill array(s)"),
                body("skills.*.easy_values")
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const numParamKeys = ["min", "max"];
                        Object.keys(val).forEach(property => {
                            if (!numParamKeys.includes(property)) {
                                noExtra = false;
                                return;
                            }
                        })
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in one of the easy numerical values"),
                body("skills.*.medium_values")
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const numParamKeys = ["min", "max"];
                        Object.keys(val).forEach(property => {
                            if (!numParamKeys.includes(property)) {
                                noExtra = false;
                                return;
                            }
                        })
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in one of the medium numerical values"),
                body("skills.*.difficult_values")
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const numParamKeys = ["min", "max"];
                        Object.keys(val).forEach(property => {
                            if (!numParamKeys.includes(property)) {
                                noExtra = false;
                                return;
                            }
                        })
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in one of the difficult numerical values"),
                errorHandler
            ]
        }
        case "updateTopic": {
            return [
                attribute.topicId(),
                attribute.topic_name("topic_name").optional(),
                attribute.skills("skills").optional(),
                attribute.skill_code("skills.*.skill_code").optional(),
                attribute.skill_name("skills.*.skill_name").optional(),
                attribute.num_of_qn("skills.*.num_of_qn").optional(),
                attribute.percent_difficult("skills.*.percent_difficulty").optional(),
                attribute.duration("skills.*.duration").optional(),
                attribute.easy_values_min("skills.*.easy_values.min").optional(),
                attribute.easy_values_max("skills.*.easy_values.max").optional(),
                attribute.easy_min_max("skills.*.easy_values").optional(),
                attribute.medium_values_min("skills.*.medium_values.min").optional(),
                attribute.medium_values_max("skills.*.medium_values.max").optional(),
                attribute.medium_min_max("skills.*.medium_values").optional(),
                attribute.difficult_values_min("skills.*.difficult_values.min").optional(),
                attribute.difficult_values_max("skills.*.difficult_values.max").optional(),
                attribute.difficult_min_max("skills.*.difficult_values").optional(),
                param()
                    .custom(param => {
                        const keys = ["topicId"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                // catches error if body has extra unexpected parameters
                body()
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const topicKeys = ["topic_name", "skills"];
                        Object.keys(val).forEach(property => {
                            if (!topicKeys.includes(property)) {
                                noExtra = false;
                                return;
                            }
                        });
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in the topics array"),
                body("skills.*")
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const skillKeys = ["skill_code", "skill_name", "num_of_qn", "percent_difficulty", "duration", "easy_values", "medium_values", "difficult_values"];
                        Object.keys(val).forEach(property => {
                            if (!skillKeys.includes(property)) {
                                noExtra = false;
                                return;
                            }
                        })
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in one of the skill array(s)"),
                body("skills.*.easy_values")
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const numParamKeys = ["min", "max"];
                        Object.keys(val).forEach(property => {
                            if (!numParamKeys.includes(property)) {
                                noExtra = false;
                                return;
                            }
                        })
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in one of the easy numerical values"),
                body("skills.*.medium_values")
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const numParamKeys = ["min", "max"];
                        Object.keys(val).forEach(property => {
                            if (!numParamKeys.includes(property)) {
                                noExtra = false;
                                return;
                            }
                        })
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in one of the medium numerical values"),
                body("skills.*.difficult_values")
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const numParamKeys = ["min", "max"];
                        Object.keys(val).forEach(property => {
                            if (!numParamKeys.includes(property)) {
                                noExtra = false;
                                return;
                            }
                        })
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in one of the difficult numerical values"),
                errorHandler
            ]
        }
    }
}