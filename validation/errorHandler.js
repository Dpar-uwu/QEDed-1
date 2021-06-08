const { validationResult } = require("express-validator");

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

