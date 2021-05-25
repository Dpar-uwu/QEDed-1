const mongoose = require("mongoose");
const { Schema } = mongoose;
const { SkillSchema } = require("./skillModel");

const TopicSchema = new Schema({
    level: {
        type: Number,
        min: 1,
        max: 6,
        required: "Level of topic required"
    },
    category: {
        type: String,
        required: "Category required"
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
    // adding topics without skills
    createTopicEmpty: (level, category, topic_name) => {
        return new Promise(async(resolve, reject) => {
            try {
                const newTopic = new Topic({ level, category, topic_name });
                const result = await newTopic.save();

                if (!result) throw "UNEXPECTED_ERROR";
                resolve(result);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        })
    },
    // adding topics with skills
    createTopicWithSkills: (level, category, topic_name, skills) => {
        return new Promise(async(resolve, reject) => {
            try {
                // skills is an array type
                // chg json to schema object?? TODO: Test if needed
                for(let skill of skills) {
                    skill = new Skill({skill});
                }
                const newTopic = new Topic({ level, category, topic_name, skills });
                const result = await newTopic.save();

                if (!result) throw "UNEXPECTED_ERROR";
            } catch (err) {
                console.error(err);
                reject(err);
            }
        })
    },
}

module.exports = topicModel;