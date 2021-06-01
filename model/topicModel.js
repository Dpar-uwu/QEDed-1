const mongoose = require("mongoose");
const { Schema } = mongoose;


// child schema
const { SkillSchema } = require("./skillModel");

const TopicSchema = new Schema({
    topic_name: {
        type: String,
        required: "Topic name required"
    },
    skills: [ SkillSchema ]
});


const topicModel = {
    TopicSchema
    // Go to levelModel for topic functions
};

module.exports = topicModel;