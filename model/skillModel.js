const mongoose = require("mongoose");
const { Schema } = mongoose;
const { NumParamSchema } = require("./numericalParamModel");

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
        type: Number
    },
    easy_values: {
        type: NumParamSchema,
        required: "Easy values required"
    },
    medium_values: {
        type: NumParamSchema,
        required: "Intermediate values required"
    },
    difficult_values: {
        type: NumParamSchema,
        required: "Difficult values required"
    }
});

const Skill = mongoose.model("Skill", SkillSchema);

const skillModel = {
    SkillSchema
}

module.exports = skillModel;