const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const GameSchema = new Schema({
    user_id:{
        type: ObjectId,
        required : "User Id is required"
    },
    points:{
        type: Number,
        default: 0
    },
    life: {
        type: Number,
        default: 0
    },
    high_score:{
        type: Number,
        default: 0
    },
    character_health: {
        type: Number,
        default: 50
    },
    character_speed: {
        type: Number,
        default: 3
    },
    bullet_speed: {
        type: Number,
        default: 3
    },
    bullet_strength: {
        type: Number,
        default: 15
    },
    reload_time: {
        type: Number,
        default: 1000
    },
    magazine: {
        type: Number,
        default: 5
    },
    shooting_speed:{
        type: Number,
        default: 1000
    }
});

const Game = mongoose.model("Game", GameSchema)

const gameModel = {
    GameSchema,
    // get game by user id
    getGameInfoByUserId: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Game.findOne({ user_id: ObjectId(userId) });
                
                if (!result) throw "NOT_FOUND";
                
                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch(err) {
                console.error("ERROR! Could not get game by user id:", err);
                reject(err);
            }
        })
    },
    createGameInfoByUserId: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const newGame = new Game({user_id: userId});
                const result = await newGame.save();
                
                if (!result) throw "UNEXPECTED_ERROR";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not add new user:", err);
                reject(err);
            }
        })
    },
    updateGameInfoById: (userId, changedFields) => {
        return new Promise(async (resolve, reject) => {
            try {
                let game = await Game.findOne({ user_id: ObjectId(userId) });

                if (!game) throw "NOT_FOUND";

                // updating changed user fields
                for(property in changedFields) {
                    game[property] = changedFields[property];
                };

                const result = await game.save();
                if(!game) throw "UNEXPECTED_ERROR";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Failed to game with user id ${userId}: ${err}`);
                reject(err);
            }
        })
    },
    deleteGame: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Game.findOneAndDelete({user_id : ObjectId(userId)});

                if (!result) throw "NOT_FOUND";
                
                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Failed to delete game info with id ${userId}`);
                reject(err);
            }
        })
    },
}

module.exports = gameModel;