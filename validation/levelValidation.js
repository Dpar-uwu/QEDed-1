const { body, param, query, header, cookie } = require("express-validator");
const { errorHandler } = require("../validation/errorHandler");

let attribute = {
    levelId: () => {
        return param("levelId", "Level ID is required")
            .stripLow().trim().escape()
            .notEmpty().withMessage("Level  ID cannot be empty")
            .isMongoId().withMessage("Level ID given is not a Mongo ID")

    },
    /**
     * level
     */
    level: (location = "level") => {
        return body(location, "Level is required")
            .stripLow().trim().escape()
            .notEmpty().withMessage("Level cannot be empty")
            .bail()
            .isInt().withMessage("Level required, must be an integer")
            .toInt()
    },

    // no santization required for arrays as it is not a string
    topics: (location = "topics") => {
        return body(location)
            .isArray().withMessage("Topics is not in array format")
    },

    // topic ID
    topicId: () => {
        return param("topicId", "Topic ID is required")
            .stripLow().trim().escape()
            .notEmpty().withMessage("Topic ID cannot be empty")
            .isMongoId().withMessage("Topic ID given is not a Mongo ID")
    },

    /**
     * level > topics
     */
    topic_name: (location = "topics.*.topic_name") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Topic name cannot be empty")
            .bail()
            .matches(/^(?=.*[a-zA-Z])([a-zA-Z0-9_\-, ]+)$/).withMessage("Topic name should contain letters, numbers, _, -, \, and whitespaces only")
    },
    // skill ID
    skillId: () => {
        return param("skillId", "Skill ID is required")
            .stripLow().trim().escape()
            .notEmpty().withMessage("Skill ID cannot be empty")
            .isMongoId().withMessage("Skill ID given is not a Mongo ID")
    },
    skills: (location = "topics.*.skills") => {
        return body(location)
            .isArray().withMessage("Skills is not in array format")
    },

    // level > topics > skills
    skill_code: (location = "topics.*.skills.*.skill_code") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Skill code cannot be empty")
            .bail()
            .matches(/^(?=.*[A-Z])([A-Z0-9_\-]+)$/).withMessage("Topic name should letters, numbers, _, -, \, and whitespaces only")
    },
    skill_name: (location = "topics.*.skills.*.skill_name") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Skill name cannot be empty")
            .bail()
            .matches(/^(?=.*[a-zA-Z])([a-zA-Z0-9_\-, ]+)$/).withMessage("Skill name should contain letters, numbers, _, -, \, and whitespaces only")
    },
    num_of_qn: (location = "topics.*.skills.*.num_of_qn") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Skill name cannot be empty")
            .bail()
            .isInt({ min: 1 }).withMessage("Number of questions must be an integer")
            .toInt()
    },
    percent_difficult: (location = "topics.*.skills.*.percent_difficulty") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Percent difficulty cannot be empty")
            .bail()
            .matches(/^\d{1}0-\d{1}0-\d{1}0$/).withMessage("Percent difficulty should contain numbers in multiples of 10 separated by - e.g. 20-50-30")
            .bail()
            .custom((val, { req }) => {
                let percentages = val.split("-");
                let total = 0;
                percentages.forEach(percent => {
                    if (percent % 10 == 0) {
                        total += parseInt(percent)
                    }
                    else return false
                });
                return total == 100;
            }).withMessage("Percent difficulty must be a multiple of 10 and add up to 100%")
    },
    duration: (location = "topics.*.skills.*.duration") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Duration cannot be empty")
            .bail()
            .isInt({ min: 1 }).withMessage("Duration must be an integer that is at least 1")
            .toInt()
    },

    /**
     * level > topics > skills > easy_values
     */
    easy_values_min: (location = "topics.*.skills.*.easy_values.min") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Easy values minimum cannot be empty")
            .bail()
            .isInt().withMessage("Minimun value (easy) must be an integer")
            .toInt()
    },

    easy_values_max: (location = "topics.*.skills.*.easy_values.max") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Easy values maximum cannot be empty")
            .bail()
            .isInt().withMessage("Maximum value (easy) must be an integer")
            .toInt()
    },

    easy_min_max: (location = "topics.*.skills.*.easy_values") => {
        return body(location)
            .custom((val, { req }) => {
                if(val && val.min && val.max)
                    return val.min < val.max;
                return true; //ignore if easy values dun exist
            }).withMessage("Minimun value must be smaller that maximum value")
    },
    // level > topics > skills > medium_values
    medium_values_min: (location = "topics.*.skills.*.medium_values.min") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Medium values minimum cannot be empty")
            .bail()
            .isInt().withMessage("Minimun value (medium) must be an integer")
            .toInt()
    },

    medium_values_max: (location = "topics.*.skills.*.medium_values.max") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Medium values maximum cannot be empty")
            .bail()
            .isInt().withMessage("Maximum value (medium) must be an integer")
            .toInt()
    },

    medium_min_max: (location = "topics.*.skills.*.medium_values") => {
        return body(location)
            .custom((val, { req }) => {
                if(val && val.min && val.max)
                    return val.min < val.max;
                return true;
            }).withMessage("Minimun value must be smaller that maximum value")
    },
    // level > topics > skills > difficult_values
    difficult_values_min: (location = "topics.*.skills.*.difficult_values.min") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Difficult values minimum cannot be empty")
            .bail()
            .isInt().withMessage("Minimun value (difficult) must be an integer")
            .toInt()
    },

    difficult_values_max: (location = "topics.*.skills.*.difficult_values.max") => {
        return body(location)
            .stripLow().trim().escape()
            .notEmpty().withMessage("Difficult values maximum cannot be empty")
            .bail()
            .isInt().withMessage("Maximum value (difficult) must be an integer")
            .toInt()
    },

    difficult_min_max: (location = "topics.*.skills.*.difficult_values") => {
        return body(location)
            .custom((val, { req }) => {
                if(val && val.min && val.max)
                    return val.min < val.max;
                return true;
            }).withMessage("Minimun value must be smaller that maximum value")
    }

}

exports.attribute = attribute;



exports.validate = (method) => {
    switch (method) {
        case "createLevel": {
            return [
                attribute.level(),
                attribute.topics(),
                attribute.topic_name(),
                attribute.skills(),
                attribute.skill_code(),
                attribute.skill_name(),
                attribute.num_of_qn(),
                attribute.percent_difficult(),
                attribute.duration(),
                attribute.easy_values_min(),
                attribute.easy_values_max(),
                attribute.easy_min_max(),
                attribute.medium_values_min(),
                attribute.medium_values_max(),
                attribute.medium_min_max(),
                attribute.difficult_values_min(),
                attribute.difficult_values_max(),
                attribute.difficult_min_max(),
                // catches error if body has extra unexpected parameters
                body()
                    .custom(body => {
                        const keys = ["level", "topics"];
                        return Object.keys(body).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                // catches error if topics array has extra unexpected parameters
                body("topics")
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const topicKeys = ["topic_name", "skills"];
                        val.forEach(topic => {
                            Object.keys(topic).forEach(property => {
                                if (!topicKeys.includes(property)) {
                                    noExtra = false;
                                    return;
                                }
                            })
                        });
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in the topics array"),
                // catches error if skills array has extra unexpected parameters
                body("topics.*.skills.*")
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
                // catches error if easy_values in skills array has extra unexpected parameters
                body("topics.*.skills.*.easy_values")
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
                // catches error if medium_values in skills array has extra unexpected parameters
                body("topics.*.skills.*.medium_values")
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
                // catches error if difficult_values in skills array has extra unexpected parameters
                body("topics.*.skills.*.difficult_values")
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
        case "levelId": {
            return [
                attribute.levelId(),
                // catches error if body has extra unexpected parameters
                param()
                    .custom(param => {
                        const keys = ["levelId"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                errorHandler
            ]
        }
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
        case "updateLevel": {
            return [
                attribute.levelId(),
                attribute.level().optional(),
                attribute.topics().optional(),
                attribute.topic_name().optional(),
                attribute.skills().optional(),
                attribute.skill_code().optional(),
                attribute.skill_name().optional(),
                attribute.num_of_qn().optional(),
                attribute.percent_difficult().optional(),
                attribute.duration().optional(),
                attribute.easy_values_min().optional(),
                attribute.easy_values_max().optional(),
                attribute.easy_min_max().optional(),
                attribute.medium_values_min().optional(),
                attribute.medium_values_max().optional(),
                attribute.medium_min_max().optional(),
                attribute.difficult_values_min().optional(),
                attribute.difficult_values_max().optional(),
                attribute.difficult_min_max().optional(),
                body()
                    .optional()
                    .custom(body => {
                        const keys = ["level", "topics"];
                        return Object.keys(body).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                // catches error if topics array has extra unexpected parameters
                body("topics")
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const topicKeys = ["topic_name", "skills"];
                        val.forEach(topic => {
                            Object.keys(topic).forEach(property => {
                                if (!topicKeys.includes(property)) {
                                    noExtra = false;
                                    return;
                                }
                            })
                        });
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in the topics array"),
                // catches error if skills array has extra unexpected parameters
                body("topics.*.skills.*")
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
                // catches error if easy_values in skills array has extra unexpected parameters
                body("topics.*.skills.*.easy_values")
                    .optional()
                    .custom(val => {
                        let noExtra = true;
                        const numParamKeys = ["min", "max"];
                        Object.keys(val).forEach(property => {
                            if (!numParamKeys.includes(property)) {
                                console.log(numParamKeys.includes(property))
                                console.log(property)
                                noExtra = false;
                                return;
                            }
                        })
                        return noExtra;
                    }).withMessage("Some extra parameters are sent in one of the easy numerical values"),
                // catches error if medium_values in skills array has extra unexpected parameters
                body("topics.*.skills.*.medium_values")
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
                // catches error if difficult_values in skills array has extra unexpected parameters
                body("topics.*.skills.*.difficult_values")
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
};