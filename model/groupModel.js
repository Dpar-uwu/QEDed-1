const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;
const { QuizSchema } = require("./quizModel")
const { AssignmentSchema } = require("./assignmentModel");
const { PostSchema } = require("./postModel");

// creating group object schema
const GroupSchema = new Schema({
    group_name: {
        type: String,
        required: "Group Name required"
    },
    owner: {
        type: ObjectId,
        required: "Owner required"
    },
    members: {
        type: [{
            user_id: {
                type: ObjectId,
                required: "User ID required"
            },
            is_admin: {
                type: Boolean,
                default: false,
                required: "Admin tag required"
            }
        }]
    },
    posts: [PostSchema]
});

const Group = mongoose.model("Group", GroupSchema);
const Quiz = mongoose.model("Quiz", QuizSchema);

const groupModel = {
    GroupSchema,
    // get all groups of a user by user id DONE
    getGroupsByUser: (user_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Group.find({ "members.user_id": ObjectId(user_id) }).select('-__v');

                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                console.log(result.length);
                resolve(result[0]);
            } catch (err) {
                console.error("ERROR! Could not get groups by userid:", err);
                reject(err);
            }
        })
    },

    // get all member by grp id DONE
    getMemberByGrpId: (groupId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Group.find({ "_id": groupId }).select('owner members.user_id');
                console.log(result)
                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result[0]);
            } catch (err) {
                console.error("ERROR! Could not get members by grp:", err);
                reject(err);
            }
        })
    },

    // get specific group by group id  DONE
    getGroupById: (groupId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Group.findOne({ "_id": groupId }).select("-__v");
                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not get grp by id:", err);
                reject(err);
            }
        })
    },

    // create group with members  DONE
    createGroup: (group_name, owner, members) => {
        return new Promise(async (resolve, reject) => {
            try {
                const newGroup = new Group({ group_name, "owner": ObjectId(owner), members });
                const result = await newGroup.save();

                if (!result) throw "UNEXPECTED_ERROR";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not create group", err);
                reject(err);
            }
        })
    },

    // add new member(existing user) by user id to existing grp  DONE
    addMember: (groupId, user_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const group = await Group.findOne({ "_id": ObjectId(groupId) });
                console.log(group)
                if (!group) throw "NOT_FOUND";

                // find if members exist in the grp
                const found = group.members.find(element => element.user_id == user_id);
                console.log(found)
                if (found) throw "UNEXPECTED_ERROR";

                // append user to db array and save to db
                group.members.push({ user_id });

                const result = group.save();

                if (!result) throw "UNEXPECTED_ERROR";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not update group with id ${groupId}: ${err}`);
                reject(err);
            }
        })
    },
    // remove member member(existing user) by user id from a grp DONE
    removeMember: (groupId, user_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const group = await Group.findOne({ "_id": ObjectId(groupId), "members.user_id": ObjectId(user_id) });
                if (!group) throw "NOT_FOUND";

                // find index of the user in the array that matches the id
                const foundIndex = group.members.findIndex(element => element.user_id == user_id);
                if (!foundIndex) throw "NOT_FOUND";

                // delete member from members array
                group.members.pull(group.members[foundIndex]);
                // save changes
                const result = await group.save();

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not delete group with id ${groupId}: ${err}`);
                reject(err);
            }
        })
    },
    // make a member an admin by user id   DONE
    makeGroupAdmin: (groupId, user_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const group = await Group.findOne({ "_id": ObjectId(groupId) });
                if (!group) throw "NOT_FOUND";

                // find if members exist in the grp
                const found = group.members.find(element => element.user_id == user_id);
                console.log(found)
                if (!found) throw "NOT_FOUND";

                // find if member is an admin
                const isAdmin = found.is_admin;
                console.log(isAdmin)
                if (isAdmin == true) throw "UNEXPECTED_ERROR"

                found.is_admin = !found.is_admin;
                const result = group.save();

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not update group with id ${groupId}: ${err}`);
                reject(err);
            }
        })
    },
    // remove admin right of a user  DONE
    dismissGroupAdmin: (groupId, user_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const group = await Group.findOne({ "_id": ObjectId(groupId) });
                console.log(group)
                if (!group) throw "NOT_FOUND";

                // find if members exist in the grp
                const found = group.members.find(element => element.user_id == user_id);
                console.log(found)
                if (!found) throw "NOT_FOUND";

                // find if member is an admin
                const isAdmin = found.is_admin;
                console.log(isAdmin)
                if (isAdmin == false) throw "UNEXPECTED_ERROR"

                found.is_admin = !found.is_admin;
                const result = group.save();

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not update group with id ${groupId}: ${err}`);
                reject(err);
            }
        })
    },
    // as in who has/has not completed the quiz assigned
    viewProgressByGrpId: (groupId) => {
    },
    // outstand quiz?
    viewUndone: (groupId, user_is) => {

    },

    // get benchmark of a grp by grp id
    viewGroupBenchmark: (groupId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Quiz.aggregate([
                    {
                        $lookup
                    },
                    {
                        $lookup
                    }
                ])
            } catch (err) {

            }
        })
    },

    // get leaderboard 

    // delete by group id DONE
    deleteGroupById: (groupId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Group.findByIdAndDelete(ObjectId(groupId));

                if (!result) throw "NOT_FOUND";

                console.log("Yayy, Result: ", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not delete group with id ${groupId}: ${err}`);
                reject(err);
            }
        })
    },

    /**
     * Post Functions
     */
    // get posts by group id  DONE
    getPostsByGrpId: (groupId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Group.find({ "_id": groupId }).select("posts");
                if (!result) throw "NOT_FOUND";

                console.log("SUCESS! Result", result);
                console.log(result.length);
                resolve(result[0]);
            } catch (err) {
                console.error(`ERROR! Could not get post by ${groupId}: ${err}`);
                reject(err);
            }
        })
    },
    // get post by id  DONE
    getPostById: (postId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // return postId, content, made_by
                const result = await Group.aggregate([
                    { $unwind: '$posts' },
                    { $match: { "posts._id": ObjectId(postId) } },
                    { $project: { _id: 0, "postId": "$posts._id", "content": "$posts.content", "made_by": "$posts.made_by", "created_at": "$posts.created_at" } }
                ]);

                if (!result || result.length == 0) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result[0]); //result will be an array with only 1 object
            } catch (err) {
                console.error(`ERROR! Could not get post with id ${postId}: ${err}`);
                reject(err);
            }
        })
    },
    // add post in a group  DONE
    createPostByGrpId: (groupId, post) => {
        return new Promise(async (resolve, reject) => {
            try {
                const group = await Group.findOne({ _id: groupId });
                if (!group) throw "NOT_FOUND";

                // append new post to db array and save to db
                group.posts.push(post);
                const result = await group.save();

                if (!result) throw "UNEXPECTED_ERROR";
                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not add post using grp id ${groupId}, ${err}`);
                reject(err);
            }
        })
    },
    // update post by post id 
    updatePostById: (postId, content) => {
        return new Promise(async (resolve, reject) => {
            try {
                const group = await Group.findOne({ "posts._id": postId });
                if (!group) throw "NOT_FOUND";

                // find the topic in the array that matches the id
                const found = group.posts.find(element => element._id == postId);

                // update changed fields to group
                group.posts.content = content;
                console.log(group.posts.content)

                // save changes to db
                const result = await group.save();

                //if (!result) throw "UNEXPECTED_ERROR";
                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not update post using id ${postId}: ${err}`);
                reject(err);
            }
        })
    },
    // deleting post by grp id DONE
    deletePostById: (postId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const group = await Group.findOne({ "posts._id": postId });
                if (!group) throw "NOT_FOUND"

                // find index of the post in the array that matches the id
                const foundIndex = group.posts.findIndex(element => element._id == postId);
                if (!foundIndex) throw "NOT_FOUND";

                // delete post from posts array
                group.posts.pull(group.posts[foundIndex]);
                // save changes
                const result = await group.save();

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not delete post with id ${postId}: ${err}`);
                reject(err);
            }
        })
    },

    /**
     * Assignment Functions
     */
    // get all assignment by grp id
    getAsgByGrpId: (groupId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Group.find({ "_id": groupId }).select('assignments');
                console.log(result)
                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result[0]);
            } catch (err) {
                console.error("ERROR! Could not get assignments by grp:", err);
                reject(err);
            }
        })
    },
    // get all assignment by user id  do we rlly need this?
    getAsgByUserId: (user_id) => {
        
    },
    // assign quiz to a grp  
    createAsgbyGrpId: (groupId, assignment) => {
        return new Promise(async (resolve, reject) => {
            try {
                const group = await Group.findOne({ "_id": groupId });
                if (!group) throw "NOT_FOUND";

                // append new assignment to db array and save to db
                group.assignments.push(assignment);
                const result = await group.save();

                if (!result) throw "UNEXPECTED_ERROR";
                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not assign quiz to grp", err);
                reject(err);
            }
        })
    },
}

module.exports = groupModel;