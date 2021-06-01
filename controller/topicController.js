/**
 * Topic Controller with routes
 */

const express = require("express");
const router = express.Router();

// model with functions
const levelModel = require("../model/levelModel");

// validation
const { validate } = require("../validation/levelValidation");
const { errorHandler } = require("../validation/userValidation");


/**
 * GET /topic - gets all topics
 */
router.route("/:topicId")
    .get(async (req, res) => {
        const { topicId } = req.params;
        try {
            console.time("GET all topics");
            const result = await levelModel.getTopicById(topicId);

            res.status(200).json(result);
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting topic by id", code: "UNEXPECTED_ERROR" });
        } finally {
            // timing the function
            console.timeEnd("GET all topics");
        }
    });

/**
 * POST /topic - add new topic
 */
router.route("/:levelId")
    .post(
        validate("params.levelId"),
        errorHandler,
        async (req, res) => {
            const { levelId } = req.params;
            const { topic_name, skills } = req.body;
            try {
                console.time("POST topic");
                const result = await levelModel.createTopicByLevelId(levelId, { topic_name, skills });

                res.status(200).send({ message: "Topic Added" })
            } catch (err) {
                if (err == "NOT_FOUND")
                    res.status(404).send({ error: "Level ID not found", code: err });
                else if (err instanceof Error || err instanceof MongoError)
                    res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
                else
                    res.status(500).send({ error: "Error creating topic by level id", code: "UNEXPECTED_ERROR" });
            } finally {
                console.timeEnd("POST topic");
            }
        });

/**
 * PUT /topic/:topicId - update existing topic by id
 */
router.route("/:topicId")
    .put(async (req, res) => {
        const { topicId } = req.params;
        const changedFields = { ...req.body };
        try {
            console.time("PUT topic by id");
            const result = await levelModel.updateTopicById(topicId, changedFields);

            res.status(200).send({ message: "Topic Updated" });
        } catch (err) {
            if (err == "NOT_FOUND")
                res.status(404).send({ error: "Topic ID not found", code: err });
            else if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error updating topic", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("PUT topic by id");
        }
    });



/**
 * DELETE /topic/:topicId - delete topic by id
 */
router.route("/:topicId")
    .delete(async (req, res) => {
        const { topicId } = req.params;
        try {
            console.time("DELETE topic by id");
            const result = await levelModel.deleteTopicById(topicId);

            res.status(200).send({ message: "Topic Deleted" });
        } catch (err) {
            if (err == "NOT_FOUND")
                res.status(404).send({ error: "Topic ID not found", code: err });
            else if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error deleting topic", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("DELETE topic by id");
        }
    });

module.exports = router;