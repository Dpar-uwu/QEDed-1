const mongoose = require("mongoose");
const { Schema } = mongoose;

const NumParamSchema = new Schema({
    min: {
        type: Number,
        required: "Minimum value required"
    },
    max: {
        type: Number,
        required: "Maximum value required"
    }
});

const NumericalParam = mongoose.model("NumericalParam", NumParamSchema);

const numParamModel = {
    NumParamSchema
}

module.exports = numParamModel;