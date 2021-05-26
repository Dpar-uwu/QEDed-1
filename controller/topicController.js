/**
 * Topic Controller with routes
 */

const topic = require("../model/topicModel");


const express = require("express");
const router = express.Router();


/**
 * GET /topic - gets all topics
 */
router.route("/")
    .get(async (req, res) => {
        try {
            console.time("GET all topics");
            const result = await topic.getAllTopics();

            res.status(200).send({ topics: result });
        } catch (err) {
            console.error("ERROR! Could not get all topics:", err);
            res.status(500).send({ error: "Error getting all topics", code: "UNEXPECTED_ERROR" });
        } finally {
            // timing the function
            console.timeEnd("GET all topics");
        }
    });

/**
 * POST /topic - add new topic
 */
router.route("/")
    .post(async (req, res) => {
        try {
            console.time("POST topic");
            const { level, topic_name, skills } = req.body;

            const result = await topic.createTopic(level, topic_name, skills);

            res.status(200).send({ message: "Topic Added" })
        } catch (err) {
            console.error("ERROR! Could not create topic:", err);
            res.status(500).send({ error: "Error creating topic", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST topic");
        }
    });

/**
 * PUT /topic/:topicId - update existing topic by id
 */
router.route("/:topicId")
    .put(async (req, res) => {
        try {
            console.time("PUT topic by id");
            const { topicId } = req.params;
            const changedFields = {...req.body};

            const result = topic.updateTopicById(topicId, changedFields);
            console.log("SUCCESS! Result:", result);

            res.status(200).send({message: "Updated Topic"});
        } catch(err) {
            console.error(`ERROR! Could not update topic with id ${topicId}: ${err}`);
            res.status(500).send({ error: "Error updating topic", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("PUT topic by id");
        }
    })

module.exports = router;