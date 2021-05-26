const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;
const { SkillSchema } = require("./skillModel");

const TopicSchema = new Schema({
    level: {
        type: Number,
        min: 1,
        max: 6,
        required: "Level of topic required"
    },
    topic_name: {
        type: String,
        required: "Topic name required"
    },
    skills: {
        type: [ SkillSchema ]
    }
});

const Topic = mongoose.model("Topic", TopicSchema);
const Skill = mongoose.model("Skill", SkillSchema);


const topicModel = {
    TopicSchema,
    // get all topics
    getAllTopics: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Topic.find().select("-__v");

                if (!result) throw "UNEXPECTED_ERROR";
                resolve(result);
            } catch(err) {
                console.error(err);
                reject(err);
            }
        })
    },
    // adding topics with skills
    // can supply level, topic_name, (optional) skills
    createTopic: (level, topic_name, skills = []) => {
        return new Promise(async(resolve, reject) => {
            try {
                // skills is an array type
                // chg json to schema object?? TODO: Test if needed
                // for(let skill of skills) {
                //     skill = new Skill({skill});
                // }
                console.log(level, topic_name, skills);
                const newTopic = new Topic({ level, topic_name, skills });
                const result = await newTopic.save();

                if (!result) throw "UNEXPECTED_ERROR";
                resolve(result);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        })
    },
    updateTopicById: (topicId, changedFields) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Topic.findByIdAndUpdate(ObjectId(topicId), changedFields);
                if (!result) throw "UNEXPECTED_ERROR";
                resolve(result);
            } catch(err) {
                console.error(err);
                reject(err);
            }
        })
    },
}

module.exports = topicModel;