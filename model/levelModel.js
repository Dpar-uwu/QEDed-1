const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;
const { TopicSchema } = require("./topicModel");

const LevelSchema = new Schema({
    level: {
        type: Number,
        required: "Academic level required"
    },
    topics: [ TopicSchema ]
});


const Level = mongoose.model("Level", LevelSchema);

const levelModel = {
    LevelSchema,
    /**
     * Level Functions
     */
    // get all levels
    getAllLevels: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Level.find().select("-__v");

                if (!result) throw "UNEXPECTED_ERROR";
                
                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not get all level and their topics:", err);
                reject(err);
            }
        })
    },
    // get specific level by id
    getLevelById: (levelId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Level.findOne({ _id: ObjectId(levelId) }).select("-__v");

                if (!result) throw "NOT_FOUND";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch(err) {
                console.error("ERROR! Could not get level by id:", err);
                reject(err);
            }
        })
    },
    // adding levels with topics and skills
    // can supply level, (optional) topics
    createLevel: (level, topics = [], options = {"unique":false}) => {
        return new Promise(async (resolve, reject) => {
            try {
                const newLevel = new Level({ level, topics });

                // if unique option is true, find existing level before saving
                if(options.unique) {
                    const lvlExists = await Level.find({ level });
                    if(lvlExists && lvlExists.length > 0) {
                        throw "LEVEL_EXISTS";
                    }
                }
                
                const result = await newLevel.save();

                if (!result) throw "UNEXPECTED_ERROR";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not add level", err);
                reject(err);
            }
        })
    },
    // update level or the data embedded it by id
    updateLevelById: (levelId, changedFields) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Level.findByIdAndUpdate(ObjectId(levelId), changedFields);

                if (!result) throw "NOT_FOUND";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not update level with id ${levelId}: ${err}`);
                reject(err);
            }
        })
    },
    //delete level by id
    deleteLevelById: (levelId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Level.findByIdAndDelete( ObjectId(levelId) );

                if (!result) throw "NOT_FOUND";

                console.log("SUCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Could not delete level with id ${levelId}: ${err}`);
                reject(err);
            }
        })
    },
    resetDefault: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Level.deleteMany({});

                if (!result) throw "UNEXPECTED_ERROR";
                console.log("SUCESS! Result", result);

                const defaultSyllabus = require('../datasheets/syllabus.json');
                const newLevels = new Level(defaultSyllabus);
                const result2 = newLevels.save();

                if (!result2) throw "UNEXPECTED_ERROR";

                console.log("SUCCESS! Result", result2);
                resolve(result2);
            } catch (err) {
                console.error(`ERROR! Could not reset levels to its default: ${err}`);
                reject(err);
            }
        })
    },

    /**
     * Topic Function
     */
    // get topic by id
    getTopicById: (topicId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // returns level, levelId, topicId, topic_name, skills
                const result = await Level.aggregate([
                    { $unwind: '$topics'},
                    { $match: { "topics._id": ObjectId(topicId)}},
                    { $project: { _id: 0, "levelId": "$_id", "level": 1, 
                        "topicId": "$topics._id", "topic_name": "$topics.topic_name", "skills": "$topics.skills" } }
                ]);
                
                if (!result || result.length == 0) throw "NOT_FOUND";
                
                console.log("SUCCESS! Result", result);
                resolve(result[0]); //result will be an array with only 1 object
            } catch(err) {
                console.error(`ERROR! Could not get topic with id ${topicId}: ${err}`);
                reject(err);
            }
        })
    },
    // TODO: CREATE MULTPLIE TOPICS IN LEVEL
    // add topic to existing level
    createTopicByLevelId: (levelId, topic) => {
        return new Promise(async (resolve, reject) => {
            try {
                const level = await Level.findOne({ _id: levelId });

                if(!level) throw "NOT_FOUND";
                    
                // append new topic to db array and save to db
                level.topics.push(topic);
                const result = level.save();

                console.log("SUCCESS! Result", result);
                resolve(level);
            } catch(err) {
                console.error(`ERROR! Could not add topic using level id ${levelId}: ${err}`);
                reject(err);
            }
        })
    },
    // update topic by id
    updateTopicById: (topicId, changedFields) => {
        return new Promise(async (resolve, reject) => {
            try {            
                const level = await Level.findOne({ "topics._id": topicId });

                if(!level) throw "NOT_FOUND";
                
                // find the topic in the array that matches the id
                const found = level.topics.find(element => element._id == topicId);

                // update changed fields to level
                for(property in changedFields) {
                    found[property] = changedFields[property];
                }
                
                // save changes to db
                const result = await level.save();

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch(err) {
                console.error(`ERROR! Could not update topic using id ${topicId}: ${err}`);
                reject(err);
            }
        })
    },
    deleteTopicById: (topicId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const level = await Level.findOne({ "topics._id": topicId });

                if(!level) throw "NOT_FOUND";

                // find index of the topic in the array that matches the id
                const foundIndex = level.topics.findIndex(element => element._id == topicId)
                level.topics.pull(level.topics[foundIndex]); // delete topic from topics array

                const result = await level.save(); // save changes

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch(err) {
                console.error(`ERROR! Could not delete topic using id ${topicId}: ${err}`);
                reject(err);
            }
        })
    },

    /**
     * Skill Function
     */
    // get skill by id
    getSkillById: (skillId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Level.aggregate([
                    { $unwind: '$topics'},
                    { $unwind: '$topics.skills'},
                    { $match: { "topics.skills._id": ObjectId(skillId)}},
                    { $project: 
                        { _id: 0, "levelId": "$_id", "level": 1, 
                        "topicId": "$topics._id", "topic_name": "$topics.topic_name", 
                        "duration": "$topics.skills.duration",
                        "skillId": "$topics.skills._id",
                        "skill_code": "$topics.skills.skill_code",
                        "skill_name": "$topics.skills.skill_name",
                        "num_of_qn": "$topics.skills.num_of_qn",
                        "percent_difficulty": "$topics.skills.percent_difficulty",
                        "easy_values":  "$topics.skills.easy_values",
                        "medium_values":  "$topics.skills.medium_values",
                        "difficult_values":  "$topics.skills.difficult_values",
                    }}
                ]);
                if (!result || result.length == 0) throw "NOT_FOUND";
                
                console.log("SUCCESS! Result", result);
                resolve(result[0]);
            } catch(err) {
                console.error(`ERROR! Could not get skill with id ${skillId}: ${err}`);
                reject(err);
            }
        })
    },
    // add skill by topic id
    createSkillByLevelId: (topicId, skill) => {
        return new Promise(async (resolve, reject) => {
            try {
                const level = await Level.findOne({ "topics._id": topicId });
                
                if (!level) throw "NOT_FOUND";

                // find the topic in the array that matches the id
                const found = level.topics.find(element => element._id == topicId);
                console.log(found);
                // append new skill to db array and save to db
                found.skills.push(skill);
                const result = level.save();

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch(err) {
                console.error(`ERROR! Could not create skill with topic id ${topicId}: ${err}`);
                reject(err);
            }
        })
    },
    // update skill by id
    updateSkillById: (skillId, changedFields) => {
        return new Promise(async (resolve, reject) => {
            try {
                const level = await Level.findOne({ "topics.skills._id": skillId });
                console.log(level)
                if (!level) throw "NOT_FOUND";

                // find the skill in the array that matches the id
                // const found = level.topics[0].skills.find(element => element._id == skillId );

                let found;
                let temp;
                level.topics.forEach(topic => {
                    temp = topic.skills.find(element => element._id == skillId );
                    if(temp) found = temp;
                })
                console.log("Skill found:", found)
                if(!found) throw "NOT_FOUND";
                
                // update changed fields to level
                for(property in changedFields) {
                    found[property] = changedFields[property];
                }
                console.log("Updated skill:", found)
                const result = level.save();

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch(err) {
                console.error(`ERROR! Could not update skill by id ${skillId}: ${err}`);
                reject(err);
            }
        })
    },
    // delete skill by id
    deleteSkillById: (skillId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const level = await Level.findOne({ "topics.skills._id": skillId });

                if (!level) throw "NOT_FOUND";

                // find index of the skill in the array that matches the id
                let topicIndex;
                let count = 0;
                let foundIndex;
                let tempIndex;
                level.topics.forEach(topic => {
                    // console.log(topic.skills)
                    tempIndex = topic.skills.findIndex(element => element._id == skillId );
                    if(tempIndex != -1) {
                        foundIndex = tempIndex;
                        topicIndex = count;
                    }
                    count++
                })

                if(tempIndex == -1) throw "NOT_FOUND";

                console.log("Skill found:", level.topics[topicIndex].skills[foundIndex])
                // deleting from skill array
                level.topics[topicIndex].skills.pull(level.topics[topicIndex].skills[foundIndex]); // delete skill from topics array

                console.log("Skill post-deleted:", level.topics[topicIndex].skills)
                const result = await level.save(); // save changes

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch(err) {
                console.error(`ERROR! Could not delete skill by id ${skillId}: ${err}`);
                reject(err);
            }
        })
    }
};


module.exports = levelModel;