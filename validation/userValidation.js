
const { body, param, query, header, cookie } = require("express-validator");
const { errorHandler } = require("../validation/errorHandler");

// store attribute validation here
let attribute = {
    userId: () => {
        return param("userId", "userId is required")
            .stripLow()
            .trim()
            .escape()
            .isMongoId().withMessage("User ID given is not a mongo id")
    },
    
    first_name: () => {
        return body("first_name", "First Name must only contain alphabets, spaces and -")
            .stripLow() // sanitisation before validation
            .trim()
            .escape()
            .notEmpty()
            .bail() // stop checking if previous is invalid, fn can be repeated
            .matches(/^(?=.*[a-zA-Z])([a-zA-Z -]+)$/)
    }, // ignore spaces and -

    last_name: () => {
        return body("last_name", "Last Name must only contain alphabets, spaces and -")
            .stripLow()
            .trim()
            .escape()
            .notEmpty()
            .bail()
            .matches(/^(?=.*[a-zA-Z])([a-zA-Z -]+)$/)
    },

    email: () => {
        return body("email", "Email must be a valid format")
            .stripLow()
            .trim()
            .escape()
            .notEmpty()
            .bail()
            .isEmail()
    },

    password: () => {
        return body("password", "Password must conatin at least 1 uppercase, 1 lowercase, 1 digit, 1 special char, at least 8 chars long and have no whitespaces")
            .notEmpty()
            .bail()
            .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])([a-zA-Z0-9@$!%*?&]{8,})$/)
    },

    gender: () => {
        return body("gender", "Gender must be F or M")
            .stripLow()
            .escape()
            .notEmpty()
            .bail()
            .isIn(["F", "M"])
    },

    role: () => {
        return body("role", "Role must be parent, teacher or student")
            .stripLow()
            .escape()
            .notEmpty()
            .bail()
            .isIn(["parent", "teacher", "student", "admin"])
            .bail()
            .custom((val, { req }) => {
                //checks that school and role is not empty if role is student
                if (val == "student")
                    return (req.body.grade != undefined && req.body.school != undefined);
                else if (val == "parent" || val == "teacher" || val == "admin")
                    return (req.body.grade == undefined && req.body.school == undefined);
                return false;
            }).withMessage("School and Grade is required for student users only")
    },

    school: () => {
        return body("school", "School must only contain alphabets, spaces and -, required if role is student")
            .stripLow()
            .escape()
            .optional()
            .matches(/^(?=.*[a-zA-Z])([a-zA-Z -]+)$/)
            .trim()
    },


    grade: () => {
        return body("grade", "Grade must be a number min 1 and max 6, required if role is student")
            .stripLow()
            .escape()
            .optional()
            .bail()
            .isInt({ min: 1, max: 6 })
            .trim()
            .toInt()
    },

    exp_points: () => {
        return body("exp_points", "EXP must be a integer")
            .stripLow()
            .escape()
            .optional()
            .bail()
            .isInt()
            .trim()
            .toInt()
    },

    rank_level: () => {
        return body("exp_points", "Rank Level must be a integer")
            .stripLow()
            .escape()
            .optional()
            .bail()
            .isInt()
            .trim()
            .toInt()
    },

    token: () => {
        return body("token", "Token must be a integer")
            .stripLow()
            .escape()
            .optional()
            .bail()
            .isInt()
            .trim()
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
                body("password", "Password required")
                    .stripLow()
                    .escape()
                    .notEmpty(),
                // catches error if body has extra unexpected parameters
                body()
                    .custom(body => {
                        const keys = ["email", "password"];
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
        case "updateUser": {
            return [
                attribute.userId(),
                attribute.first_name().optional(),
                attribute.last_name().optional(),
                attribute.email().optional(),
                attribute.password().optional(),
                attribute.gender().optional(),
                attribute.role().optional(),
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