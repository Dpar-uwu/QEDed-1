/**
 * Notification controller and routes
 */

const express = require("express");
const router = express.Router();

// model and functions
const notificationModel = require("../model/notificationModel");

// error handler modules
const { MongoError } = require("mongodb");
const { Error } = require("mongoose");

/**
 * GET /notification/user?userId=
 */
router.get("/user",
    async (req, res) => {
        const { userId } = req.query;
        try {
            console.time("GET noti by userid");
            const result = await notificationModel.getNotificationByUser(userId);
            res.status(200).send(result);
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting notification by user id", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("GET noti by userid");
        }
    });

/**
* GET /notification/notification?notificationId=&userId= - get noti by id
*/
router.get("/notification",
    //validate("quizId"),
    async (req, res) => {
        const { notificationId, userId } = req.query;
        try {
            console.time("GET noti by id");
            const result = await notificationModel.getNotificationById(notificationId, userId);

            res.status(200).send(result);
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting noti by id", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("GET noti by id");
        }
    });


/**
* POST /notification/assignment?asgId
*/
router.post("/assignment",
    async (req, res) => {
        const { asgId, skillId } = req.query;
        const { to, subject, content } = req.body;
        try {
            console.time("POST notification by asgId");
            const result = await notificationModel.createNotiByAsgId(to, asgId, skillId, subject, content);

            res.status(200).send({ new_id: result._id });
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error sending notification by asgId", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST notification by asgId");
        }
    });

/**
* POST /notification/quiz?quizId
*/
router.post("/quiz",
    async (req, res) => {
        const { quizId } = req.query;
        const { to, subject, content } = req.body;
        try {
            console.time("POST notification by quizId");
            const result = await notificationModel.createNotiByQuizId(to, quizId, subject, content);

            res.status(200).send({ new_id: result._id });
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error sending notification by quizId", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST notification by quizId");
        }
    });

/**
* PUT /notification/dismissNoti dismiss noti by id
*/
router.put("/dismissNoti",
    async (req, res) => {
        const { userId, notificationId } = req.query;
        try {
            console.time("PUT dismiss noti by userid");
            const result = await notificationModel.dismissNotificationById(userId, notificationId);

            res.status(200).send({ message: "Notification Dismissed" });
        } catch (err) {
            console.log(err)
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error dismissing noti", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("PUT dismiss noti by userid");
        }
    });

/**
* PUT /notification/user?userId dismiss noti by userid
*/
router.put("/user",
    async (req, res) => {
        const { userId } = req.query;
        try {
            console.time("PUT dismiss all noti by userid");
            const result = await notificationModel.dismissAllNotificationByUser(userId);

            res.status(200).send({ message: "All Notifications Dismissed" });
        } catch (err) {
            console.log(err)
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error dismissing all noti", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("PUT dismiss all noti by userid");
        }
    });


/**
 * For sending email 
 */

/**
* POST /notification/expired?quizId
*/
router.post("/expired",
    async (req, res) => {
        const { assignment_id } = req.query;
        const { to, subject, content } = req.body;
        try {
            console.time("POST notification by quizId");
            const result = await notificationModel.sendDeadlineNotification(assignment_id, to, subject, content);

            res.status(200).send({ new_id: result._id });
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error sending notification by quizId", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST notification by quizId");
        }
    });

module.exports = router;