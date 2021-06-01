
const { body, param, query, header, cookie, validationResult } = require("express-validator");

exports.validate = (method) => {
    switch (method) {
        case "createUser": {
            return [
                body("first_name", "First Name must only contain alphabets, spaces and -")
                    .stripLow() // sanitisation before validation
                    .trim()
                    .escape()
                    .notEmpty()
                    .bail() // stop checking if previous is invalid, fn can be repeated
                    .matches(/^(?=.*[a-zA-Z])([a-zA-Z -]+)$/), // ignore spaces and -
                body("last_name", "Last Name must only contain alphabets, spaces and -")
                    .stripLow()
                    .trim()
                    .escape()
                    .notEmpty()
                    .bail()
                    .matches(/^(?=.*[a-zA-Z])([a-zA-Z -]+)$/),
                body("email", "Email must be a valid format")
                    .stripLow()
                    .trim()
                    .escape()
                    .notEmpty()
                    .bail()
                    .isEmail()
                    .bail()
                    .normalizeEmail(),
                body("password", "Password must conatin at least 1 uppercase, 1 lowercase, 1 digit, 1 special char, at least 8 chars long and have no whitespaces")
                    .stripLow()
                    .escape()
                    .notEmpty()
                    .bail()
                    .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])([a-zA-Z0-9@$!%*?&]{8,})$/),
                body("gender", "Gender must be F or M")
                    .stripLow()
                    .escape()
                    .notEmpty()
                    .bail()
                    .isIn(["F", "M"]),
                body("role", "Role must be parent, teacher or student")
                    .stripLow()
                    .escape()
                    .notEmpty()
                    .bail()
                    .isIn(["parent", "teacher", "student", "admin"])
                    .bail()
                    .custom((val, {req}) => {
                        //checks that school and role is not empty if role is student
                        if(req.body.role == "student")
                            return (req.body.grade != undefined && req.body.school != undefined);
                        else if(req.body.role == "parent" || req.body.role == "teacher" || req.body.role == "admin")
                            return (req.body.grade == undefined && req.body.school == undefined);
                        return false;
                    }).withMessage("School and Grade is required for student users only"),
                body("school", "School must only contain alphabets, spaces and -, required if role is student")
                    .stripLow()    
                    .escape()
                    .optional()
                    .matches(/^(?=.*[a-zA-Z])([a-zA-Z -]+)$/)
                    .trim(),
                body("grade", "Grade must be a number min 1 and max 6, required if role is student")
                    .stripLow()
                    .escape()
                    .optional()
                    .bail()
                    .isInt({ min: 1, max: 6 })
                    .trim()
                    .toInt(),
                // catches error if body has extra unexpected parameters
                // from: https://stackoverflow.com/questions/57991701/is-there-a-way-to-check-if-the-req-body-is-including-just-set-of-parameters
                body()
                    .custom(body => {
                        const keys = ["first_name", "last_name", "email", "password", "gender", "role", "school", "grade"];
                        return Object.keys(body).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent")
            ]
        }
        case "loginUser": {
            return [
                body("email", "Email must be a valid format")
                    .stripLow()
                    .trim()
                    .escape()
                    .notEmpty()
                    .bail()
                    .isEmail()
                    .bail()
                    .normalizeEmail(),
                body("password", "Password must conatin at least 1 uppercase, 1 lowercase, 1 digit, 1 special char, at least 8 chars long and have no whitespaces")
                    .stripLow()
                    .escape()
                    .notEmpty(),
                // catches error if body has extra unexpected parameters
                body()
                    .custom(body => {
                        const keys = ["email", "password"];
                        return Object.keys(body).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent")
            ]
        }
        case "searchUser": {
            return [
                query("query", "Email must be a valid format")
                    .stripLow()
                    .trim()
                    .escape()
                    .if(query("query").isEmail()).normalizeEmail(),
                // catches error if body has extra unexpected parameters
                query()
                    .custom(query => {
                        const keys = ["query"];
                        return Object.keys(query).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent")
            ]
        }
        case "params.userId": {
            return [
                param("userId", "userId is required")
                    .stripLow()
                    .trim()
                    .escape()
                    .isMongoId().withMessage("User ID given is not a mongo id"),
                // catches error if body has extra unexpected parameters
                param()
                    .custom(param => {
                        const keys = ["userId"];
                        return Object.keys(param).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent")
            ]
        }
        case "updateUser": {
            return [
                body("first_name", "First Name must only contain alphabets, spaces and -")
                    .stripLow()
                    .trim()
                    .escape()
                    .optional()
                    .bail() // stop checking if previous is invalid, fn can be repeated
                    .matches(/^(?=.*[a-zA-Z])([a-zA-Z -]+)$/), // ignore spaces and -
                body("last_name", "Last Name must only contain alphabets, spaces and -")
                    .stripLow()
                    .trim()
                    .escape()
                    .optional()
                    .bail()
                    .matches(/^(?=.*[a-zA-Z])([a-zA-Z -]+)$/),
                body("email", "Email must be a valid format")
                    .stripLow()
                    .trim()
                    .escape()
                    .optional()
                    .bail()
                    .isEmail()
                    .bail()
                    .normalizeEmail(),
                body("password", "Password must conatin at least 1 uppercase, 1 lowercase, 1 digit, 1 special char, at least 8 chars long and have no whitespaces")
                    .stripLow()
                    .escape()
                    .optional()
                    .bail()
                    .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])([a-zA-Z0-9@$!%*?&]{8,})$/),
                body("gender", "Gender must be F or M")
                    .stripLow()
                    .escape()
                    .optional()
                    .bail()
                    .isIn(["F", "M"]),
                body("role", "Role must be parent, teacher or student")
                    .stripLow()
                    .escape()
                    .optional()
                    .bail()
                    .isIn(["parent", "teacher", "student", "admin"])
                    .bail()
                    .custom((val, {req}) => {
                        //checks that school and role is not empty if role is student
                        if(req.body.role == "student")
                            return (req.body.grade != undefined && req.body.school != undefined);
                        else if(req.body.role == "parent" || req.body.role == "teacher" || req.body.role == "admin")
                            return (req.body.grade == undefined && req.body.school == undefined);
                        return false;
                    }).withMessage("School and Grade is required for student users only"),
                body("school", "School must only contain alphabets, spaces and -, required if role is student")
                    .stripLow()    
                    .escape()
                    .optional()
                    .matches(/^(?=.*[a-zA-Z])([a-zA-Z -]+)$/)
                    .trim(),
                body("grade", "Grade must be a number min 1 and max 6, required if role is student")
                    .stripLow()
                    .escape()
                    .optional()
                    .bail()
                    .isInt({ min: 1, max: 6 })
                    .trim()
                    .toInt(),
                // catches error if body has extra unexpected parameters
                // from: https://stackoverflow.com/questions/57991701/is-there-a-way-to-check-if-the-req-body-is-including-just-set-of-parameters
                body()
                    .custom(body => {
                        const keys = ["first_name", "last_name", "email", "password", "gender", "role", "school", "grade"];
                        return Object.keys(body).every(key => keys.includes(key));
                    })
                    .withMessage("Some extra parameters are sent")
            ]
        }
    }
};


//go to next fn if no validation error
exports.errorHandler = (req, res, next) => {
    // Finds the validation errors in req
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        console.error("ERROR! Validation error:", errors);
        const messages = [];
        errors.array().forEach(err => messages.push(err.msg));
        res.status(422).send({ error: messages, code: "INVALID_REQUEST" });
        return;
    }
    next();
};