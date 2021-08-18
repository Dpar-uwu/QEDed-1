/**
 * Game controller and routes
 */

const express = require("express");
const router = express.Router();

// model and functions
const gameModel = require("../model/gameModel");

// error handler modules
const { MongoError } = require("mongodb");
const { Error } = require("mongoose");

const { validate } = require("../validation/userValidation");
/**
 * GET /game/:userId=
 */
router.get("/",
    validate("gameInfo"),
    async (req, res) => {
        const { user_id } = req.query;
        try {
            console.time("GET game info by userid");

            const result = await gameModel.getGameInfoByUserId(user_id);

            res.status(200).send(result);
        } catch (err) {
            if (err == 'NOT_FOUND')
                res.status(404).send({ error: err, code: 'NOT_FOUND' });
            else if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting game info by userid", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("GET game info by userid");
        }
    }
);

/**
 * POST /game
 */
router.post("/",
    validate("gameInfo"),
    async (req, res) => {
        const { user_id } = req.query;
        try {
            console.time("POST game info");
            const result = await gameModel.createGameInfoByUserId(user_id);

            res.status(200).send(result);
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error POST game info by user id", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST game info");
        }
    }
);

/**
 * PUT /game/:userId - update existing game information by id
 */
router.put("/",
    validate("gameInfo"),
    async (req, res) => {
        const { user_id } = req.query;
        const changedFields = { ...req.body };
        try {
            console.time("PUT game by user id");
            const result = await gameModel.updateGameInfoById(user_id, changedFields);

            res.status(200).send({ message: "Game Info Updated", result: result });
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error updating game", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("PUT game by user id");
        }
    }
);

router.delete("/:userId",
    validate("userId"),
    async (req, res) => {
        const { userId } = req.params;
        try {
            console.time("DELETE Game Info");
            const result = await gameModel.deleteGame(userId);

            res.status(200).send({ message: "Game Info Deleted" });
        } catch (err) {
            if (err == "NOT_FOUND")
                res.status(404).send({ error: "User ID not found", code: err });
            else if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error deleting Game Info by user id", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("DELETE Game Info");
        }
    }
);

module.exports = router;