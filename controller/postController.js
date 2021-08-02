/**
 * Post controller and routes
 */

const express = require("express");
const router = express.Router();

// model and functions
const groupModel = require("../model/groupModel");

// error handler modules
const { MongoError } = require("mongodb");
const { Error } = require("mongoose");

/**
 * REST API
 */
/**
 * GET /post/group?groupId=
 */
router.get("/group",
    //validate("userId"),
    async (req, res) => {
        const { groupId } = req.query;
        try {
            console.time("GET posts by groupID");
            const result = await groupModel.getPostsByGrpId(groupId);
            res.status(200).send(result);
        } catch (err) {
            // if (err == "NOT_FOUND")
            //     res.status(404).send({ error: "User ID not found", code: err });
            // else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting post by grp id", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("GET posts by groupID");
        }
    });

/**
 * GET /post/:postId - get post by id
 */
router.get("/:postId",
    //validate("topicId"),
    async (req, res) => {
        const { postId } = req.params;
        try {
            console.time("GET post by id");
            const result = await groupModel.getPostById(postId);

            res.status(200).json(result);
        } catch (err) {
            // if (err == "NOT_FOUND")
            //     res.status(404).send({ error: "Topic ID not found", code: err });
            // else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error getting post by id", code: "UNEXPECTED_ERROR" });
        } finally {
            // timing the function
            console.timeEnd("GET post by id");
        }
    });

/**
 * POST /post/:groupId - add new post by grp id
 */
router.post("/:groupId",
    //validate("createTopic"),
    async (req, res) => {
        const { groupId } = req.params;
        const { content, made_by } = req.body;
        try {
            console.time("POST post");
            const result = await groupModel.createPostByGrpId(groupId, { content, made_by });

            res.status(200).send({ new_id: result._id });
        } catch (err) {
            // if (err == "NOT_FOUND")
            //     res.status(404).send({ error: "Level ID not found", code: err });
            // else
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error creating post by grp id", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("POST post");
        }
    });

/**
 * PUT /post/:postId - update existing post by id
 */
router.put("/:postId",
    //validate("updateTopic"),
    async (req, res) => {
        const { postId } = req.params;
        const content = req.body;
        try {
            console.time("PUT post by id");
            const result = await groupModel.updatePostById(postId, content);

            res.status(200).send({ message: "Post Updated" });
        } catch (err) {
            // if (err == "NOT_FOUND")
            //     res.status(404).send({ error: "Topic ID not found", code: err });
            // else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error updating post", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("PUT post by id");
        }
    });

/**
* DELETE /post/:postId - delete postId by id
*/
router.delete("/:postId",
    //validate("topicId"),
    async (req, res) => {
        const { postId } = req.params;
        try {
            console.time("DELETE post by id");
            const result = await groupModel.deletePostById(postId);

            res.status(200).send({ message: "Post Deleted" });
        } catch (err) {
            // if (err == "NOT_FOUND")
            //     res.status(404).send({ error: "Topic ID not found", code: err });
            // else 
            if (err instanceof Error || err instanceof MongoError)
                res.status(500).send({ error: err.message, code: "DATABASE_ERROR" });
            else
                res.status(500).send({ error: "Error deleting post", code: "UNEXPECTED_ERROR" });
        } finally {
            console.timeEnd("DELETE post by id");
        }
    });


/**
 * SOCKET
 */
const postSocket = async (message) => {
    const { group_id, post } = message;
    console.log(group_id, post);
    const result = await groupModel.createPostByGrpId(group_id, post);
    return result;
}

module.exports = { router, postSocket };