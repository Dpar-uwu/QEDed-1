/**
 * User Controller with user routes
 */

const user = require("../model/userModel");

const express = require("express");
const router = express.Router();

/**
 * GET /user - gets all users
 */
router.route("/")
    .get(async (req, res) => {
        try {
            console.time("GET all users");
            const result = await user.getAllUsers();
            
            res.status(200).send({users: result});
        } catch(err) {
            console.error("ERROR! Could not get all users:", err);
            res.status(500).send({error: "Error getting all users", code: "UNEXPECTED_ERROR"});
        } finally {
            // timing the function
            console.timeEnd("GET all users");
        }
    });


/**
 * GET /user/search?q=email - search user by email
 */
router.route("/search")
.get(async (req, res) => {
    try {
        console.time("GET user by email");
        const { q } = req.query;
        const result = await user.searchUserByEmail(decodeURI(q));

        if(!result) throw "NO_MATCH";
        res.status(200).send(result);
    } catch(err) {
        console.error("ERROR! Could not get user stats:", err);
        if(err == "NO_MATCH")
            res.status(400).send({error: "No user by this email", code: err});
        res.status(500).send({error: "Error getting user by email", code: "UNEXPECTED_ERROR"});
    } finally {
        // timing the function
        console.timeEnd("GET user by email");
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
            
            res.status(200).send(result);
        } catch(err) {
            console.error("ERROR! Could not get user stats:", err);
            res.status(500).send({error: "Error getting user stats", code: "UNEXPECTED_ERROR"});
        } finally {
            // timing the function
            console.timeEnd("GET user stats");
        }
    });


/**
 * POST /user/signup - add new user
 */
router.route("/signup")
    .post(async (req, res) => {
        try {
            console.time("POST new User");
            const { first_name, last_name, email, password, role, school, grade } = req.body;

            const result = await user.addNewUser(first_name, last_name, email, password, role, school, grade);
            
            console.log("SUCCESS! Result:", result);
            res.status(201).send({ message: "User Created"});
        } catch(err) {
            if(err == "EMAIL_EXISTS")
                res.status(400).send({ error: "Email already exists", code: err });
            res.status(500).send({ error: "Could not add user", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST new User");
        }
    });


/**
 * POST /user/login - verify user by email and pw
 */
router.route("/login")
    .post(async (req, res) => {
        try {
            console.time("GET verify user with email and pw");
            const { email, password } = req.body;

            const result = await user.verifyUser(email, password);
            res.status(200).send({ user: result });
        } catch(err) {
            console.error("ERROR! Failed to verify user:", err);
            if(err == "INVALID_USER")
                res.status(400).send({ error: "Email or password is incorrect", code: err });
            res.status(500).send({ error: "Could not verify user", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("GET verify user with email and pw");
        }
    });


/**
 * PUT /user/updateProfile - update user by id
 */
router.route("/updateProfile/:userId")
    .put(async (req, res) => {
        try {
            console.time("PUT user");
            const changedFields = {...req.body};
            const { userId } = req.params;

            const result = await user.updateProfile(userId, changedFields);

            console.log("SUCCESS! Result:", result);
            res.status(200).send({user: "Updated User"});
        } catch(err) {
            console.error("ERROR! Failed to update user with email");
            res.status(500).send({error: "Could not update profile", code: "UNEXPECTED_ERROR"});
        } finally {
            console.timeEnd("PUT user");
        }
    });


/**
 * PUT /user/deleteProfile - deactivate user by id
 */
router.route("/deactivateProfile/:userId")
    .put(async (req, res) => {
        try {
            console.time("PUT deactivate user");
            const { userId } = req.params;

            const result = await user.deactivateUser(userId);

            console.log("SUCCESS! Result:", result);
            res.status(200).send({user: "Deactivated User"});
        } catch(err) {
            console.error("ERROR! Failed to deactivate account");
            res.status(500).send({error: "Could not deactivate account", code: "UNEXPECTED_ERROR"});
        } finally {
            console.timeEnd("PUT deactivate user");
        }
    });




module.exports = router;