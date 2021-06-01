const { body, param, query, header, cookie } = require("express-validator");
const { TopicSchema } = require("../model/topicModel");

exports.validate = (method) => {
    switch (method) {
        case "createLevel": {
            return [
                // level
                body("level", "Level is required")
                    .stripLow().trim().escape()
                    .optional()
                    .notEmpty()
                    .bail()
                    .isInt().withMessage("Level required, must be an integer")
                    .toInt(),
                // no santization required for arrays as it is not a string
                body("topics")
                    .optional()
                    .isArray().withMessage("Topics is not in array format"),

                // level > topics
                body("topics.*.topic_name")
                    .stripLow().trim().escape()
                    .optional()
                    // topic name required if topics is not empty
                    .if(body("topics").isArray({ min: 1 })).notEmpty().withMessage("Topic name required")
                    .bail()
                    .matches(/^(?=.*[a-zA-Z])([a-zA-Z0-9_\-, ]+)$/).withMessage("Topic name should contain letters, numbers, _, -, \, and whitespaces only"),
                body("topics.*.skills")
                    .optional()
                    .isArray().withMessage("Skills is not in array format"),

                // level > topics > skills
                body("topics.*.skills.*.skill_code")
                    .stripLow().trim().escape()
                    .optional()
                    // topic name required if topics is not empty
                    .if(body("topics.*.skills").isArray({ min: 1 })).notEmpty().withMessage("Skill code required")
                    .bail()
                    .matches(/^(?=.*[A-Z])([A-Z0-9_\-]+)$/).withMessage("Topic name should letters, numbers, _, -, \, and whitespaces only"),
                body("topics.*.skills.*.skill_name")
                    .stripLow().trim().escape()
                    .optional()
                    .if(body("topics.*.skills").isArray({ min: 1 })).notEmpty().withMessage("Skill name required")
                    .bail()
                    .matches(/^(?=.*[a-zA-Z])([a-zA-Z0-9_\-, ]+)$/).withMessage("Skill name should contain letters, numbers, _, -, \, and whitespaces only"),
                body("topics.*.skills.*.num_of_qn")
                    .stripLow().trim().escape()
                    .optional()
                    .if(body("topics.*.skills").isArray({ min: 1 })).notEmpty().withMessage("Number of questions required")
                    .bail()
                    .isInt({ min: 1 }).withMessage("Number of questions must be an integer")
                    .toInt(),
                body("topics.*.skills.*.percent_difficulty")
                    .stripLow().trim().escape()
                    .optional()
                    .if(body("topics.*.skills").isArray({ min: 1 })).notEmpty().withMessage("Percentage difficulty required")
                    .bail()
                    .matches(/^\d{1}0-\d{1}0-\d{1}0$/).withMessage("Percent difficulty should contain numbers separated by -\'s. Eg. 20-50-30")
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
                    }).withMessage("Percent difficulty must be a multiple of 10 and add up to 100%"),
                body("topics.*.skills.*.duration")
                    .stripLow().trim().escape()
                    .optional()
                    .if(body("topics.*.skills").isArray({ min: 1 })).notEmpty().withMessage("Duration of quiz required")
                    .bail()
                    .isInt({ min: 1 }).withMessage("Duration must be an integer")
                    .toInt(),

                // level > topics > skills > easy_values
                body("topics.*.skills.*.easy_values.min")
                    .stripLow().trim().escape()
                    .optional()
                    .if(body("topics.*.skills").isArray({ min: 1 })).notEmpty().withMessage("Minimun value (easy) required")
                    .bail()
                    .isInt().withMessage("Minimun value (easy) must be an integer")
                    .toInt(),
                body("topics.*.skills.*.easy_values.max")
                    .stripLow().trim().escape()
                    .optional()
                    .if(body("topics.*.skills").isArray({ min: 1 })).notEmpty().withMessage("Maximum value (easy) required")
                    .bail()
                    .isInt().withMessage("Maximum value (easy) must be an integer")
                    .toInt()
                    .bail(),
                body("topics.*.skills.*.easy_values")
                    .custom((val, { req }) => {
                        return val.min < val.max;
                    }).withMessage("Minimun value must be smaller that maximum value"),

                // level > topics > skills > medium_values
                body("topics.*.skills.*.medium_values.min")
                    .stripLow().trim().escape()
                    .optional()
                    .if(body("topics.*.skills").isArray({ min: 1 })).notEmpty().withMessage("Minimun value (medium) required")
                    .bail()
                    .isInt().withMessage("Minimun value (medium) must be an integer")
                    .toInt(),
                body("topics.*.skills.*.medium_values.max")
                    .stripLow().trim().escape()
                    .optional()
                    .if(body("topics.*.skills").isArray({ min: 1 })).notEmpty().withMessage("Maximum value (medium) required")
                    .bail()
                    .isInt().withMessage("Maximum value (medium) must be an integer")
                    .toInt()
                    .bail(),
                body("topics.*.skills.*.medium_values")
                    .custom((val, { req }) => {
                        return val.min < val.max;
                    }).withMessage("Minimun value must be smaller that maximum value"),

                // level > topics > skills > difficult_values
                body("topics.*.skills.*.difficult_values.min")
                    .stripLow().trim().escape()
                    .optional()
                    .if(body("topics.*.skills").isArray({ min: 1 })).notEmpty().withMessage("Minimun value (difficult) required")
                    .bail()
                    .isInt().withMessage("Minimun value (difficult) must be an integer")
                    .toInt(),
                body("topics.*.skills.*.difficult_values.max")
                    .stripLow().trim().escape()
                    .optional()
                    .if(body("topics.*.skills").isArray({ min: 1 })).notEmpty().withMessage("Maximum value (difficult) required")
                    .bail()
                    .isInt().withMessage("Maximum value (difficult) must be an integer")
                    .toInt()
                    .bail(),
                body("topics.*.skills.*.difficult_values")
                    .custom((val, { req }) => {
                        return val.min < val.max;
                    }).withMessage("Minimun value must be smaller that maximum value"),
            ]
        }
        case "params.levelId": {
            return [
                param("levelId", "Level ID is required")
                    .stripLow().trim().escape()
                    .isMongoId().withMessage("Level ID given is not a mongo id"),
                // catches error if body has extra unexpected parameters
                param()
                    .custom(param => {
                        const keys = ["levelId"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent")
            ]
        }
    }
};