/**
 * User Controller and Routes
 */
const express = require("express");
const router = express.Router();

// model with functions
const user = require("../model/userModel");

// validation
const userValidator = require("../validation/userValidation");
const { validate, errorHandler } = require("../validation/userValidation");

// error handler modules
const { MongoError } = require("mongodb");
const { Error } = require("mongoose");

/**
 * GET /user - gets all users
 */
router.route("/")
    .get(async (req, res) => {
        try {
            console.time("GET all users");
            const result = await user.getAllUsers();

            res.status(200).json(result);
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting all users", code: "UNEXPECTED_ERROR" });
        } finally {
            // timing the function
            console.timeEnd("GET all users");
        }
    });



/**
 * GET /user/search?query=email - search user by email
 */
router.route("/search")
    .get(
        // validation middleware
        validate("searchUser"),
        errorHandler,
        async (req, res) => {
            const { query } = req.query;
            try {
                console.time("GET search user by email");
                const result = await user.searchUserByEmail(query);

                res.status(200).json(result);
            } catch (err) {
                if (err instanceof Error || err instanceof MongoError)
                    res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
                else
                    res.status(500).send({ error: "Error getting user by email", code: "UNEXPECTED_ERROR" });
            } finally {
                // timing the function
                console.timeEnd("GET search user by email");
            }
        });


/**
 * GET /user/stats - view stats (admin)
 */
router.route("/stats")
    .get(async (req, res) => {
        try {
            console.time("GET user stats");
            const result = await user.viewUserStats();

            res.status(200).json(result);
        } catch (err) {
            res.status(500).send({ error: "Error getting user stats", code: "UNEXPECTED_ERROR" });
        } finally {
            // timing the function
            console.timeEnd("GET user stats");
        }
    });


/**
 * GET /user/:userId
 */
router.route("/:userId")
    .get(
        validate("params.userId"),
        errorHandler,
        async (req, res) => {
            const { userId } = req.params;
            try {
                console.time("GET user by id");
                const result = await user.getUserById(userId);

                res.status(200).json(result);
            } catch (err) {
                if (err == "NOT_FOUND")
                    res.status(404).send({ error: "User ID not found", code: err });
                else if (err instanceof Error || err instanceof MongoError)
                    res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
                else
                    res.status(500).send({ error: "Error getting user by id", code: "UNEXPECTED_ERROR" });

            } finally {
                // timing the function
                console.timeEnd("GET user by id");
            }
        });


/**
 * POST /user - add new user
 */
router.route("/")
    .post(
        validate("createUser"),
        errorHandler,
        async (req, res) => {
            const { first_name, last_name, email, password, gender, role, school, grade } = req.body;
            try {
                console.time("POST new user");
                const result = await user.addNewUser(first_name, last_name, email, password, gender, role, school, grade);

                res.status(201).send({ message: "User Created" });
            } catch (err) {
                if (err == "EMAIL_EXISTS")
                    res.status(422).send({ error: "Email already exists", code: err });
                else if (err instanceof Error || err instanceof MongoError)
                    res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
                else
                    res.status(500).send({ error: "Could not add user", code: "UNEXPECTED_ERROR" });

            } finally {
                console.timeEnd("POST new user");
            }
        });


/**
 * POST /user/login - verify user by email and pw
 */
router.route("/login")
    .post(
        validate("loginUser"),
        errorHandler,
        async (req, res) => {
            const { email, password } = req.body;
            try {
                console.time("GET verify user");
                const result = await user.verifyUser(email, password);

                res.status(200).json(result);
            } catch (err) {
                if (err == "NO_MATCH")
                    res.status(400).send({ error: "Email or password is incorrect", code: err });
                else if (err instanceof Error || err instanceof MongoError)
                    res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
                else
                    res.status(500).send({ error: "Could not verify user", code: "UNEXPECTED_ERROR" });
            } finally {
                console.timeEnd("GET verify user");
            }
        });


/**
 * PUT /user/:userId - update user by id
 */
router.route("/:userId")
    .put(
        validate("params.userId"),
        validate("updateUser"),
        errorHandler,
        async (req, res) => {
            const changedFields = { ...req.body };
            const { userId } = req.params;

            try {
                console.time("PUT user");
                const result = await user.updateProfile(userId, changedFields);

                res.status(200).send({ message: "Updated User" });
            } catch (err) {
                if (err == "NOT_FOUND")
                    res.status(404).send({ error: "User ID not found", code: err });
                else if (err instanceof Error || err instanceof MongoError)
                    res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
                else
                    res.status(500).send({ error: "Could not update user", code: "UNEXPECTED_ERROR" });
            } finally {
                console.timeEnd("PUT user");
            }
        });


/**
 * DELETE /user/:userId - delete user by id
 */
router.route("/:userId")
    .delete(
        validate("params.userId"),
        errorHandler,
        async (req, res) => {
            const { userId } = req.params;
            try {
                console.time("DELETE user");
                const result = await user.deleteUser(userId);

                res.status(200).send({ message: "User Deleted" });
            } catch (err) {
                if (err == "NOT_FOUND")
                    res.status(404).send({ error: "User ID not found", code: err });
                else if (err instanceof Error || err instanceof MongoError)
                    res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
                else
                    res.status(500).send({ error: "Could not delete user", code: "UNEXPECTED_ERROR" });
            } finally {
                console.timeEnd("DELETE user");
            }
        });




module.exports = router;