const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

// creating post object schema
const PostSchema = new Schema({
    group_id: {
        type: ObjectId,
        required: "Group ID required"
    },
    content: {
        type: String,
        required: "Content required"
    },
    made_by: {
        type: ObjectId,
        required: "Post owner is required"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model("Post", PostSchema)

const postModel = {
    PostSchema,
    /**
     * Post Functions
     */
    // get all posts
}

module.exports = postModel;