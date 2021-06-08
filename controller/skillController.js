/**
 * Skill controller and routes
 */

const express = require("express");
const router = express.Router();

// model and functions
const levelModel = require("../model/levelModel");

// validation
const { validate } = require("../validation/skillValidation");
const { errorHandler } = require("../validation/errorHandler");

// error handler modules
const { MongoError } = require("mongodb");
const { Error } = require("mongoose");


/**
 * GET /skill/:skillId - get skill by id
 */
router.route("/:skillId")
    .get(
        validate("skillId"),
        async (req, res) => {
            const { skillId } = req.params;
            try {
                console.time("GET skill by id");
                const result = await levelModel.getSkillById(skillId);

                res.status(200).json(result);
            } catch (err) {
                if (err == "NOT_FOUND")
                    res.status(404).send({ error: "Skill ID not found", code: err });
                else if (err instanceof Error || err instanceof MongoError)
                    res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
                else
                    res.status(500).send({ error: "Error getting skill by id", code: "UNEXPECTED_ERROR" });
            } finally {
                // timing the function
                console.timeEnd("GET skill by id");
            }
        });


/**
 * POST /skill/:topicId - add new skill
 */
router.route("/:topicId")
    .post(
        validate("createSkill"),
        async (req, res) => {
            const { topicId } = req.params;
            const { skill_code, skill_name, num_of_qn, percent_difficulty, duration, easy_values, medium_values, difficult_values } = req.body;
            try {
                console.time("POST skill by topic id");
                const result = await levelModel.createSkillByLevelId(topicId, { skill_code, skill_name, num_of_qn, percent_difficulty, duration, easy_values, medium_values, difficult_values });

                res.status(200).send({ message: "Skill Added" })
            } catch (err) {
                if (err == "NOT_FOUND")
                    res.status(404).send({ error: "Topic ID not found", code: err });
                else if (err instanceof Error || err instanceof MongoError)
                    res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
                else
                    res.status(500).send({ error: "Error creating skill by topic id", code: "UNEXPECTED_ERROR" });
            } finally {
                console.timeEnd("POST skill by topic id");
            }
        });

/**
 * PUT /skill/:skillId - update skill
 */
router.route("/:skillId")
    .put(
        validate("updateSkill"),
        async (req, res) => {
            const { skillId } = req.params;
            const changedFields = { ...req.body };
            try {
                console.time("PUT skill");
                const result = await levelModel.updateSkillById(skillId, changedFields);

                res.status(200).send({ message: "Skill Updated" })
            } catch (err) {
                if (err == "NOT_FOUND")
                    res.status(404).send({ error: "Skill ID not found", code: err });
                else if (err instanceof Error || err instanceof MongoError)
                    res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
                else
                    res.status(500).send({ error: "Error updating skill by id", code: "UNEXPECTED_ERROR" });
            } finally {
                console.timeEnd("PUT skill");
            }
        });


/**
* DELETE /topic/:skillId - delete skill by id
*/
router.route("/:skillId")
    .delete(
        validate("skillId"),
        async (req, res) => {
            const { skillId } = req.params;
            try {
                console.time("DELETE skill by id");
                const result = await levelModel.deleteSkillById(skillId);

                res.status(200).send({ message: "Skill Deleted" });
            } catch (err) {
                if (err == "NOT_FOUND")
                    res.status(404).send({ error: "Skill ID not found", code: err });
                else if (err instanceof Error || err instanceof MongoError)
                    res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
                else
                    res.status(500).send({ error: "Error deleting topic", code: "UNEXPECTED_ERROR" });
            } finally {
                console.timeEnd("DELETE skill by id");
            }
        });

module.exports = router;