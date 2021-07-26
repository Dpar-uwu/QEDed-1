const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;
const { GroupSchema } = require("./groupModel")

const PostSchema = new Schema({
    // group_id: {
    //     type: ObjectId,
    //     required: "Group ID required"
    // },
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

const Post = mongoose.model("Post", PostSchema)

const postModel = {
    PostSchema,
    /**
     * Post Functions
     */
    // get post by id
    getPostById: (postId) => {
        return new Promise(async (resolve, reject) => {
            try{
                // return postId, posts
                const result = await Group.aggregate([
                    { $unwind: '$posts'},
                    { $match: {"posts._id": ObjectId(postId)}},
                    { $project: { _id: 0, "postId": "$posts._id", "content": "$posts.made_by", "made_by": "$posts.made_by", "created_at": "$posts.created_at"}}
                ]);

                if (!result || result.length == 0) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result[0]); //result will be an array with only 1 object
            }catch (err) {
                console.error(`ERROR! Could not get post with id ${postId}: ${err}`);
                reject(err);
            }
        })
    },
    // get posts by group id 
    getPostByGrpId: (group_id) => {
        return new Promise(async (resolve, reject) => {
            try{
                const result = await Post.find({"group_id": ObjectId(group_id)}).select("-__v");

                if (!result) throw "NOT_FOUND";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not post from ${group_id}: ${err}`);
                reject(err);
            }
        })
    },
    // add post in a group 
    createPostByGrpId: (group_id, post) => {
        return new Promise(async (resolve, reject) => {
            try {
                const group = await Group.findOne({ _id: group_id });
                if (!group) throw "NOT_FOUND";

                // append new post to db array and save to db
                group.posts.push(post);
                const result = await group.save();

                if (!result) throw "UNEXPECTED_ERROR";
                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not add post using grp id ${group_id}, ${err}`);
                reject(err);
            }
        })
    },
    // adding post in a group // do i hav to name this cotent?
    createPost: (group_id, addedFields) => {
        return new Promise(async (resolve, reject) => {
            try {
                const group = await Group.findOne({ "_id": ObjectId(group_id) });
                console.log(group)
                if (!group) throw "NOT_FOUND";

                const newPost = new Post(addedFields);
                // idk, havent test
                //const result = await newPost.find({"group_id": ObjectId(groupId)}).save();
                const result = await newPost.save();
                if (!result) throw "UNEXPECTED_ERROR";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not add post", err);
                reject(err);
            }
        })
    },
    // updating post by post id
    updatePost: (postId, newMessage) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Quiz.findByIdAndUpdate(ObjectId(postId), newMessage);

                if (!result) throw "NOT_FOUND";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not update post with id ${postId}: ${err}`);
                reject(err);
            }
        })
    },
    // deleting post in a group 
    deletePost: (postId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Quiz.findByIdAndDelete(ObjectId(postId));

                if (!result) throw "NOT_FOUND";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not delete post with id ${postId}: ${err}`);
                reject(err);
            }
        })
    }
}

module.exports = postModel;