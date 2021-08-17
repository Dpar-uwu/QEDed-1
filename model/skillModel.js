const mongoose = require("mongoose");
const { Schema } = mongoose;

const SkillSchema = new Schema({
    skill_code: {
        type: String,
        required: "Skill code required"
    },
    skill_name: {
        type: String,
        required: "Skill Name required"
    },
    num_of_qn: {
        type: Number,
        required: "Number of questions required"
    },
    percent_difficulty: {
        type: String,
        required: "Percentage difficulty required for easy, medium and difficult"
    },
    duration: {
        type: Number,
        required: "Percentage difficulty required for easy, medium and difficult"
    },
    easy_values: {
        min: {
            type: Number,
            required: "Minimum (easy) value required"
        },
        max: {
            type: Number,
            required: "Maximum (easy) value required"
        }
    },
    medium_values: {
        min: {
            type: Number,
            required: "Minimum (medium) value required"
        },
        max: {
            type: Number,
            required: "Maximum (medium) value required"
        }
    },
    difficult_values: {
        min: {
            type: Number,
            required: "Minimum (difficult) value required"
        },
        max: {
            type: Number,
            required: "Maximum (difficult) value required"
        }
    }
});

const skillModel = {
    SkillSchema
    // go to levelModel for skill functions
}

module.exports = skillModel;