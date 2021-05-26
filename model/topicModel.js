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
    deleteTopicByd: (topicId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Topic.findByIdAndUpdate(ObjectId(topicId));
                if (!result) throw "UNEXPECTED_ERROR";
                resolve(result);
            } catch(err) {
                console.error(err);
                reject(err);
            }
        })
    },
    resetDefault: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Topic.deleteMany({});
                if (!result) throw "UNEXPECTED_ERROR";
                console.log("OK deleted topics", result);

                const defaultTopics = 
                {
                    "level": 5,
                    "topic_name": "Fractions",
                    "skills": [
                        {
                            "skill_code": "FRAC_SIMPLIFY",
                            "skill_name": "Simplifying Fractions",
                            "num_of_qn": 10,
                            "percent_difficulty": "30-50-20",
                            "duration": 20,
                            "easy_values": {
                                "min": 1,
                                "max": 10
                            },
                            "medium_values": {
                                "min": 10,
                                "max": 20
                            },
                            "difficult_values": {
                                "min": 20,
                                "max": 30
                            }
                        },
                        {
                            "skill_code": "FRAC_ADD",
                            "skill_name": "Addition of Fractions",
                            "num_of_qn": 10,
                            "percent_difficulty": "30-50-20",
                            "duration": 20,
                            "easy_values": {
                                "min": 1,
                                "max": 10
                            },
                            "medium_values": {
                                "min": 10,
                                "max": 20
                            },
                            "difficult_values": {
                                "min": 20,
                                "max": 30
                            }
                        },
                        {
                            "skill_code": "FRAC_MULTIPLY",
                            "skill_name": "Multiplication of Fractions",
                            "num_of_qn": 10,
                            "percent_difficulty": "30-50-20",
                            "duration": 20,
                            "easy_values": {
                                "min": 1,
                                "max": 10
                            },
                            "medium_values": {
                                "min": 10,
                                "max": 20
                            },
                            "difficult_values": {
                                "min": 20,
                                "max": 30
                            }
                        }
                    ]
                };

                const newTopics = new Topic(defaultTopics);
                const result2 = newTopics.save();
                console.log("res 2:", result2);
                if (!result2) throw "UNEXPECTED_ERROR";
                console.log("OK added default topics", result2);
                resolve(result);
            } catch(err) {
                console.error(err);
                reject(err);
            }
        })
    }
}

module.exports = topicModel;