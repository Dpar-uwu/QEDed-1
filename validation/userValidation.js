
const { body, param, query, header, cookie } = require("express-validator");
const { errorHandler } = require("../validation/errorHandler");

// store attribute validation here
let attribute = {
    userId: () => {
        return param("userId")
            .notEmpty().withMessage("User ID cannot be empty").bail()
            .isMongoId().withMessage("User ID given is not a valid ID")
    },
    
    first_name: () => {
        return body("first_name")
            .notEmpty().withMessage("First Name cannot be empty").bail()
            .matches(/^(?=.*[a-zA-Z])([a-zA-Z -']+)$/).withMessage("First Name must only contain alphabets, spaces and -").bail()
            .stripLow().trim().escape()
    },

    last_name: () => {
        return body("last_name")
            .notEmpty().withMessage("Last Name cannot be empty").bail()
            .matches(/^(?=.*[a-zA-Z])([a-zA-Z -']+)$/).withMessage("Last Name must only contain alphabets, spaces and -").bail()   
            .stripLow().trim().escape()
    },

    email: () => {
        return body("email")
            .notEmpty().withMessage("Email cannot be empty").bail()
            .isEmail().withMessage("Email must be a valid format")
    },

    password: () => {
        return body("password")
            .notEmpty().withMessage("Password cannot be empty").bail()
            .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])([a-zA-Z0-9@$!%*?&]{8,})$/)
            .withMessage("Password must contain at least 1 uppercase, 1 lowercase, 1 digit, 1 special char, at least 8 chars long and have no whitespaces")
    },

    gender: () => {
        return body("gender")
            .notEmpty().withMessage("Gender cannot be empty").bail()
            .isIn(["F", "M"]).withMessage("Gender must be F or M").bail()
            .stripLow().escape()
    },

    role: () => {
        return body("role", )
            .notEmpty().withMessage("Role cannot be empty").bail()
            .isIn(["parent", "teacher", "student", "admin"]).withMessage("Role must be parent, teacher or student").bail()
            .custom((val, { req }) => {
                //checks that school and role is not empty if role is student
                if (val == "student")
                    return (req.body.grade != undefined && req.body.school != undefined);
                return true;
            }).withMessage("School and Grade are required for student users only")
            .custom((val, { req }) => {
                //checks that school and role is empty for non-student
                if (val == "parent" || val == "teacher" || val == "admin")
                    return (req.body.grade == undefined && req.body.school == undefined);
                return true;
            }).withMessage("School and Grade cannot exist for non-student users").bail()
            .stripLow().escape()
    },

    school: () => {
        return body("school")
            .optional()
            .matches(/^(?=.*[a-zA-Z])([a-zA-Z -.']+)$/)
            .withMessage("School must only contain alphabets, spaces, ' and -").bail()
            .trim().stripLow()
    },

    grade: () => {
        return body("grade")
            .optional()
            .isInt({ min: 1, max: 6 }).withMessage("Grade must be a number from 1 to 6").bail()
            .toInt()
    },

    exp_points: () => {
        return body("exp_points")
            .optional()
            .isInt().withMessage("EXP must be a integer").bail()
            .toInt()
    },

    rank_level: () => {
        return body("exp_points")
            .optional()
            .isInt().withMessage("Rank Level must be a integer").bail()
            .toInt()
    },

    token: () => {
        return body("token")
            .optional()
            .isInt().withMessage("Token must be a integer").bail()
            .toInt()
    }
}


// validation methods reusing attribute functions + adding new rules
exports.validate = (method) => {
    switch (method) {
        case "createUser": {
            return [
                attribute.first_name(),
                attribute.last_name(),
                attribute.email(),
                attribute.password(),
                attribute.gender(),
                attribute.role(),
                attribute.school(),
                attribute.grade(),
                // catches error if body has extra unexpected parameters
                // from: https://stackoverflow.com/questions/57991701/is-there-a-way-to-check-if-the-req-body-is-including-just-set-of-parameters
                body()
                    .custom(body => {
                        const keys = ["first_name", "last_name", "email", "password", "gender", "role", "school", "grade"];
                        return Object.keys(body).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                errorHandler
            ]
        }
        case "loginUser": {
            return [
                attribute.email(),
                body("password", "Password cannot be empty")
                    .stripLow()
                    .escape()
                    .notEmpty(),
                body("rememberMe", "Remember Me cannot be empty")
                    .stripLow()
                    .isBoolean()
                    .escape()
                    .notEmpty(),
                // catches error if body has extra unexpected parameters
                body()
                    .custom(body => {
                        const keys = ["email", "password","rememberMe"];
                        return Object.keys(body).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                errorHandler
            ]
        }
        case "searchUser": {
            return [
                query("query", "Email must be a valid format")
                    .stripLow()
                    .trim()
                    .escape(),
                // catches error if body has extra unexpected parameters
                query()
                    .custom(query => {
                        const keys = ["query"];
                        return Object.keys(query).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                errorHandler
            ]
        }
        case "gameInfo": {
            return [
                query("user_id", "User ID given is not a valid ID")
                    .notEmpty().withMessage("User ID cannot be empty").bail()
                    .isMongoId().withMessage("User ID given is not a valid ID"),
                // catches error if body has extra unexpected parameters
                body()
                    .custom(body => {
                        const keys = ["points", "life", "high_score", "character_health", "character_speed", "bullet_speed", "bullet_strength", "reload_time", "magazine", "shooting_speed"];
                        return Object.keys(body).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                errorHandler
            ]
        }
        case "userId": {
            return [
                attribute.userId(),
                // catches error if body has extra unexpected parameters
                param()
                    .custom(param => {
                        const keys = ["userId"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                errorHandler
            ]
        }
        case "email": {
            return [
                attribute.email(),
                // catches error if body has extra unexpected parameters
                param()
                    .custom(param => {
                        const keys = ["email"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                errorHandler
            ]
        }
        case "resetPassword": {
            return [
                attribute.password(),
                body("userId", "ERROR")
                    .isMongoId()
                    .notEmpty(),
                body("token", "ERROR")
                    .stripLow()
                    .escape()
                    .notEmpty(),
                // catches error if body has extra unexpected parameters
                param()
                    .custom(param => {
                        const keys = ["password","token","userId"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                errorHandler
            ]
        }        
        case "updateUser": {
            return [
                attribute.userId(),
                attribute.first_name().optional(),
                attribute.last_name().optional(),
                attribute.email().optional(),
                attribute.password().optional(),
                attribute.gender().optional(),
                attribute.school(),
                attribute.grade(),
                attribute.exp_points(),
                attribute.rank_level(),
                attribute.token(),
                // catches error if body has extra unexpected parameters
                body()
                    .custom(body => {
                        const keys = ["first_name", "last_name", "email", "password", "gender", "role", "school", "grade", "exp_points", "rank_level", "token"];
                        return Object.keys(body).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent"),
                errorHandler
            ]
        }
    }
};