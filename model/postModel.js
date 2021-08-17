const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const PostSchema = new Schema({
    content: {
        type: String,
        required: "Content required"
    },
    // any educator with admin rights can post? admin
    made_by: {
        type: ObjectId,
        required: "Post owner is required"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});


const postModel = {
    PostSchema,
    // Go to groupModel for post functions
}

module.exports = postModel;