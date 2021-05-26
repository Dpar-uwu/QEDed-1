/**
 * User Object - schema & functions to interact with MongoDB
 * user password hashed with bcrypt
 * 
 * TODO: Improve error handling
 * TODO: Add validation and sanitisation
 * 
 * If Mongoose has deprecation warnings, rectify at https://mongoosejs.com/docs/deprecations.html  
 * 
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;
const bcrypt = require('bcrypt');
const saltRounds = 10;

// creating user object schema
const UserSchema = new Schema({
    first_name: {
        type: String,
        required: "Please enter First Name"
    },
    last_name: {
        type: String,
        required: "Please enter Last Name"
    },
    email: {
        type: String,
        unique: true,
        index: true,
        lowercase: true,
        required: "Please enter Email"
    },
    password: {
        type: String,
        required: "Please enter Password"
    },
    gender: {
        type: String,
        enum: ["F", "M"],
        required: "Please specify Gender"
    },
    role: {
        type: String,
        lowercase: true,
        required: "Please enter Role",
        enum: ["student", "teacher", "parent", "admin"]
    },
    school: {
        type: String
    },
    grade: {
        type: Number,
        min: 1,
        max: 6
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    exp_points: {
        type: Number,
        default: 0
    },
    rank_level: {
        type: Number,
        default: 0
    },
    token: {
        type: Number,
        default: 0
    }
});

// middleware for hashing password upon "saving" a user
UserSchema.pre('save', async function hashPassword(next) {
    try {
        const user = this;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        // hash the password along with our new salt
        const hash = await bcrypt.hash(user.password, saltRounds);
        console.log("Hashed password");
        // override the cleartext password with the hashed one
        user.password = hash;
        return next();
    } catch (e) {
        console.log(e);
        return next(e);
    }
});

// this MUST come after pre save middleware
const User = mongoose.model("User", UserSchema);




const userModel = {
    UserSchema,
    // signup
    addNewUser: (first_name, last_name, email, password, gender, role, school, grade) => {
        return new Promise(async (resolve, reject) => {
            try {
                //check if email or username exists
                const emailExists = await User.findOne({ email: email }).exec();

                if (emailExists) throw "EMAIL_EXISTS";

                // save user if email is unique
                const newUser = new User({ first_name, last_name, email, password, gender,role, school, grade });
                const result = await newUser.save();

                if (!result) throw "UNEXPECTED_ERROR";
                resolve(result);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        })
    },
    // login
    verifyUser: (email, password) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await User.findOne({ email: email })
                    .select("-__v") // exclude __v from result
                    .exec();
                if (!user) throw "INVALID_USER";

                const match = await bcrypt.compare(password, user.password);
                if (!match) throw "INVALID_USER";

                // remove password before saving
                user.password = undefined;
                resolve(user);
            } catch (err) {
                reject(err);
            }
        })
    },
    //get all users
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await User.find()
                    .select("-password -__v"); //select attributes except for these 2

                if (!users) throw "UNEXPECTED_ERROR";
                resolve(users);
            } catch (err) {
                reject(err);
            }
        })
    },
    //search user by email
    searchUserByEmail: (email) => {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await User.find({
                    email: { $regex: email, $options: "i" } 
                }).select("-password -__v -isDeleted");

                resolve(users);
            } catch (err) {
                reject(err);
            }
        })
    },
    // returns total users, new users per week etc. discuss ltr
    viewUserStats: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const totalUsers = await User.countDocuments({});

                if (!totalUsers) throw "UNEXPECTED_ERROR";
                resolve({ totalUsers });
            } catch (err) {
                reject(err)
            }
        })
    },
    //updates user based on fields given
    updateProfile: (userId, changedFields) => {
        return new Promise(async (resolve, reject) => {
            console.log(changedFields);

            try {
                const result = await User.findByIdAndUpdate(ObjectId(userId), changedFields);
                if (!result) throw "UNEXPECTED_ERROR";
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    },
    //delete user
    // TODO: do we need to delete user from all existing groups too?
    deleteUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await User.findByIdAndDelete( ObjectId(userId) );
                if (!result) throw "UNEXPECTED_ERROR";
                resolve(result);
            } catch (err) {
                reject(err);
            }
        })
    }
}


module.exports = userModel;