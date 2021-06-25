/**
 * Question controller and routes
 */

const express = require("express");
const router = express.Router();

// model and functions
const quizModel = require("../model/quizModel");

// validation
 const { validate } = require("../validation/questionValidation");

// error handler modules
const { MongoError } = require("mongodb");
const { Error } = require("mongoose");

/**
 * GET /question/:questionId
 */
router.get("/:questionId",
    validate("questionId"),
    async (req, res) => {
        const { questionId } = req.params;
        try {
            console.time("GET question by ID");
            const result = await quizModel.getQuestionById(questionId);

            res.status(200).send(result);
        } catch (err) {
            if (err == "NOT_FOUND")
                res.status(404).send({ error: "Question ID not found", code: err })
            else if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting all questions", code: "UNEXPECTED_ERROR" });
        } finally {
            // timing the function
            console.timeEnd("GET question by ID");
        }
    });

/**
 * POST /question/:quizId
 * adds all questions belonging to a quiz
 */
router.post("/:quizId",
    validate("createQuestions"),
    async (req, res) => {
        const { quizId } = req.params;
        const questions = req.body;
        try {
            console.time("POST question");
            const result = await quizModel.createQuestionsByQuizId(quizId, questions);
            res.status(201).send({ message: "Questions in Quiz ID " + quizId + " Created" });
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting all questions", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST question");
        }
    });

/**
 * DELETE /question/:quizId
 * deletes all questions belonging to a quiz
 */
router.delete("/:quizId",
    validate("quizId"),
    async (req, res) => {
        const { quizId } = req.params;
        try {
            console.time("DELETE question by quiz id");
            const result = await quizModel.deleteQuestionsByQuizId(quizId);

            res.status(200).send({ message: "Questions in Quiz ID " + quizId + " Deleted" });
        } catch (err) {
            if (err == "NOT_FOUND")
                res.status(404).send({ error: "Question ID not found", code: err })
            else if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting all questions", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("DELETE question by quiz id");
        }
    });

module.exports = router;