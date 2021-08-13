/**
 * User Controller and Routes
 */
const express = require("express");
const router = express.Router();

// model with functions
const user = require("../model/userModel");
const tokenPassword = require("../model/tokenModel");

// validation
const { validate } = require("../validation/userValidation");

// authentication
const { verify } = require("jsonwebtoken");
const {
    createAccessToken,
    createRefreshToken
} = require("../auth/token");

const { isAuth } = require("../auth/authorization");


// error handler modules
const { MongoError } = require("mongodb");
const { Error } = require("mongoose");

/**
 * GET /user - gets all users
 */
router.get("/",
    isAuth,
    async (_req, res) => {
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
router.get("/search",
    // validation middleware
    validate("searchUser"),
    async (req, res) => {
        const { query } = req.query;
        console.log(query)
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
router.get("/stats",
    async (_req, res) => {
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
router.get("/:userId",
    validate("userId"),
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
router.post("/",
    validate("createUser"),
    async (req, res) => {
        const { first_name, last_name, email, password, gender, role, school, grade } = req.body;
        try {
            console.time("POST new user");
            const result = await user.addNewUser(first_name, last_name, email, password, gender, role, school, grade);

            res.status(201).send({ message: "User Created", "result": result });
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
router.post("/login",
    validate("loginUser"),
    async (req, res) => {
        const { email, password, rememberMe } = req.body;
        const { cookies } = req;
        try {
            console.time("GET verify user");
            const result = await user.verifyUser(email, password);

            if (!result._id || !result.role) throw "NO_MATCH";
            var expiry = (rememberMe == "true") ? 365 : 1;

            // grant access and refresh token
            const accessTK = createAccessToken(result._id, result.role);
            const refreshTK = createRefreshToken(result._id, result.role, expiry + "d");

            // send refresh token as cookie & access token in body
            res.cookie("refreshTK", refreshTK, {
                maxAge: expiry * 24 * 60 * 60 * 1000, //expires in x days
                httpOnly: true,
                // path: "/user" // endpoint to get new access token using refresh token
            });
            res.send({ accessTK, "user": result, "cookie": cookies });

        } catch (err) {
            console.log(err)
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
 * POST /user/logout
 */
router.post("/logout",
    (req, res) => {
        console.log(req.cookies)
        res.clearCookie("refreshTK", { path: "/" });
        res.send({ message: "Logged out successfully" });
    });

/**
 * POST /user/refresh_token
 */
router.post("/refresh_token",
    async (req, res) => {
        const token = req.cookies.refreshTK;
        console.log("cookies", req.cookies);

        try {
            console.time("POST get access token using refresh token");
            // check if token is valid
            if (!token) throw "UNAUTHENTICATED_USER";

            const payload = verify(token, process.env.REFRESH_TK_MIMI);
            const userId = payload.sub;

            const result = await user.getUserById(userId);
            // check if payload matches user DB
            if (result.role != payload.issuedRole) throw "UNAUTHENTICATED_USER";

            // IF TOKEN EXISTS AND IS VALID
            const accessTK = createAccessToken(result._id, result.role);
            res.send({ "accessToken": accessTK });

        } catch (err) {
            console.log(err)
            return res.status(401).send({ error: "Invalid Token", code: "UNAUTHENTICATED_USER" });
        } finally {
            console.timeEnd("POST get access token using refresh token");
        }

    });

    router.post("/resetPasswordRequest",
    validate("email"),
    async (req, res) => {
        const { email } = req.body;
        try {
            console.time("POST reset password request");
            
            const requestPasswordResetService = await tokenPassword.requestPasswordReset(email);
            res.status(200).send({ message: "Email sent" });
        }
        catch (err) {
            if (err == "NOT_FOUND")
                res.status(404).send({ error: "Email does not exists", code: "NOT_FOUND" });
            else if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error in reset password request", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST reset password request");
        }
    }
)
router.put("/resetPassword",
    validate("resetPassword"),
    async (req, res) => {
        try {
            const resetPasswordService = await tokenPassword.resetPassword(
                req.body.userId,
                req.body.token,
                req.body.password
            );
            res.status(200).send({ message: "Password Updated" });
        }
        catch (err) {
            console.log(err)
            if(err == "ERROR") res.status(422).send({ error: err.message, code: "DATABASE_ERROR" });
            else if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error in reseting password", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("PUT reset password");
        }
    }
)

/**
 * PUT /user/:userId - update user by id
 */
router.put("/:userId",
    validate("updateUser"),
    async (req, res) => {
        const changedFields = { ...req.body };
        const { userId } = req.params;

        try {
            console.time("PUT user");
            const result = await user.updateProfile(userId, changedFields);

            res.status(200).send({ message: "User Updated" });
        } catch (err) {
            if (err == "NOT_FOUND")
                res.status(404).send({ error: "User ID not found", code: err });
            else if (err == "INVALID_REQUEST") {
                res.status(422).send({ error: "School and grade is required to successfully switch to student role", code: err });
            }
            else if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error updating user by id", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("PUT user");
        }
    });


/**
 * DELETE /user/:userId - delete user by id
 */
router.delete("/:userId",
    validate("userId"),
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
                res.status(500).send({ error: "Error deleting user by id", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("DELETE user");
        }
    });


/**
 * POST /user/populate
 */
router.post("/populate",
    async (req, res) => {
        try {
            console.time("POST populate user");
            const result = await user.populateUsers();

            res.status(201).send({ message: "Users Populated" });
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Could not populate user", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST populate user");
        }
    });

module.exports = router;