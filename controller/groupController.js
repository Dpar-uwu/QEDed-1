/**
 * Group controller and routes
 */

const express = require("express");
const router = express.Router();

// model and functions
const groupModel = require("../model/groupModel");

// validation
//const { validate } = require("../validation/levelValidation");

// error handler modules
const { MongoError } = require("mongodb");
const { Error } = require("mongoose");

/**
 * GET /group/user?userId=
 */
router.get("/user",
    //validate("userId"),
    async (req, res) => {
        const { userId } = req.query;
        try {
            console.time("GET group by userid");
            const result = await groupModel.getGroupsByUser(userId);
            res.status(200).send(result);
        } catch (err) {
            // if (err == "NOT_FOUND")
            //     res.status(404).send({ error: "User ID not found", code: err });
            // else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting group by user id", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("GET group by userid");
        }
    });

/**
 * GET /group/members?groupId=
 */
router.get("/members",
    //validate("userId"),
    async (req, res) => {
        const { groupId } = req.query;
        try {
            console.time("GET all members by grpid");
            const result = await groupModel.getMemberByGrpId(groupId);
            res.status(200).send(result);
        } catch (err) {
            // if (err == "NOT_FOUND")
            //     res.status(404).send({ error: "Group ID not found", code: err });
            // else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting members by grpid", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("GET all members by grpid");
        }
    });

/**
* GET /group/:groupId - get grp by id
*/
router.get("/:groupId",
    //validate("quizId"),
    async (req, res) => {
        const { groupId } = req.params;
        try {
            console.time("GET group by id");
            const result = await groupModel.getGroupById(groupId);

            res.status(200).send(result);
        } catch (err) {
            // if (err == "NOT_FOUND")
            //     res.status(404).send({ error: "Group ID not found", code: err });
            // else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting grp by id", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("GET group by id");
        }
    });


/**
 * POST /group
 */
router.post("/",
    //validate("createLevel"),
    async (req, res) => {
        const { group_name, owner, members } = req.body;
        try {
            console.time("POST group");
            const result = await groupModel.createGroup(group_name, owner, members);

            res.status(201).send({ new_id: result._id });
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error adding group", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST group");
        }
    });

/**
 * POST /group/addMember?groupId=..&userId=..
 */
router.post("/addMember",
    //validate("benchmark"),
    async (req, res) => {
        const { groupId, userId } = req.query;
        
        try {
            console.time("POST addMember");
            const result = await groupModel.addMember(groupId, userId);
            res.status(200).send({ message: "Member Added" });
        } catch (err) {
            console.log(err);
            if (err == "USER_EXISTS")
                res.status(422).send({ error: "User already exists in group", code: err });
            else if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error adding member to grp", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST addMember");
        }
    });

/**
 * PUT /group?groupId=.. (update group name)
 */
router.put("/",
    //validate("benchmark"),
    async (req, res) => {
        const { groupId } = req.query;
        const { group_name } = req.body
        try {
            console.time("PUT update group name");
            const result = await groupModel.updateGroupName(groupId, group_name);
            res.status(200).send({message: "Group Name Updated"});
        } catch (err) {
            if (err == "NOT_FOUND")
                res.status(404).send({ error: "Group ID not found", code: err });
            else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error updating group name", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("PUT update group name");
        }
    });
/**
 * DELETE /group/removeMember?groupId=..&userId=..
 */
router.delete("/removeMember",
    //validate("benchmark"),
    async (req, res) => {
        const { groupId, userId } = req.query;
        // 
        try {
            console.time("DELETE removeMember");
            const result = await groupModel.removeMember(groupId, userId);
            res.status(200).send({message: "Member Deleted"});
        } catch (err) {
            // if (err == "NOT_FOUND")
            //     res.status(404).send({ error: "User ID not found", code: err });
            // else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error removing member to grp", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("DELETE removeMember");
        }
    });

/**
 * PUT /group/makeAdmin?groupId=..&userId=.. update admin to true
 */
router.put("/makeAdmin",
    //validate("updateTopic"),
    async (req, res) => {
        const { groupId, userId } = req.query;
        try {
            console.time("PUT make admin by user id");
            const result = await groupModel.makeGroupAdmin(groupId, userId);

            res.status(200).send({ message: "Group Updated" });
        } catch (err) {
            if (err == "NOT_FOUND")
                res.status(404).send({ error: "User or Group ID not found in group", code: err });
            else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error updating group admin", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("PUT make admin by user id");
        }
    });

/**
 * PUT /group/dismissAdmin?groupId=..&userId=..  update admin to false
 */
 router.put("/dismissAdmin",
 //validate("updateTopic"),
 async (req, res) => {
     const { groupId, userId } = req.query;
     try {
         console.time("PUT dismiss admin by user id");
         const result = await groupModel.dismissGroupAdmin(groupId, userId);

         res.status(200).send({ message: "Group Updated" });
     } catch (err) {
         // if (err == "NOT_FOUND")
         //     res.status(404).send({ error: "Topic ID not found", code: err });
         // else 
         if (err instanceof Error || err instanceof MongoError)
             res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
         else
             res.status(500).send({ error: "Error updating group admin", code: "UNEXPECTED_ERROR" });
     } finally {
         console.timeEnd("PUT dismiss admin by user id");
     }
 });

/**
 * POST /group/benchmark?groupId=..
 */
router.post("/benchmark",
    async (req, res) => {
        const { groupId } = req.query;
        try {
            console.time("POST group benchmark");
            const result = await groupModel.viewGroupBenchmark(groupId);

            res.status(200).send(result);
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting group benchmark", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST group benchmark");
        }
    });
 

/**
 * POST /group/leaderboard?groupId=..
 */
router.post("/leaderboard",
    async (req, res) => {
        const { groupId } = req.query;
        try {
            console.time("POST group leaderboard");
            const result = await groupModel.viewGroupLeaderboard(groupId);

            res.status(200).send(result);
        } catch (err) {
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting group leaderboard", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST group leaderboard");
        }
    });
 
/**
* DELETE /group/:groupId - delete quiz by id
*/
router.delete("/:groupId",
    //validate("quizId"),
    async (req, res) => {
        const { groupId } = req.params;
        try {
            console.time("DELETE grp by id");
            const result = await groupModel.deleteGroupById(groupId);

            res.status(200).send({ message: "Group Deleted" });
        } catch (err) {
            console.log(err)
            // if (err == "NOT_FOUND")
            //     res.status(404).send({ error: "Quiz ID not found", code: err });
            // else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error deleting grp", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("DELETE grp by id");
        }
    });


// ????
/**
 * POST /quiz/:groupId - assign quiz by grpid
 */
router.post("/:groupId",
    //validate("createTopic"),
    async (req, res) => {
        const { groupId } = req.params;
        const { skill_id, skill_name, topic_name, done_by,
            score, questions, num_of_qn, percent_difficulty, time_taken,
            isCompleted, assigned_by, deadline } = req.body;
        try {
            console.time("POST quiz by grpid");
            const result = await groupModel.assignQuizbyGrpId(groupId, {
                skill_id, skill_name, topic_name, done_by,
                score, questions, num_of_qn, percent_difficulty, time_taken,
                isCompleted, assigned_by, deadline
            });

            res.status(200).send({ new_id: result._id });
        } catch (err) {
            // if (err == "NOT_FOUND")
            //     res.status(404).send({ error: "Level ID not found", code: err });
            // else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error assigning quiz by grp id", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST quiz by grpid");
        }
    });



module.exports = router;