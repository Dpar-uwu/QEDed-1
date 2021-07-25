/**
 * User Object - schema & functions to interact with MongoDB
 * user password hashed with bcrypt
 * 
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
        type: Number
    },
    exp_points: {
        type: Number
    },
    rank_level: {
        type: Number
    },
    token: {
        type: Number
    },
    created_at: {
        type: Date,
        default: Date.now
    },
});

const studentExclusive = ["school", "grade", "exp_points", "rank_level", "token"];

// middleware for hashing password upon "saving" a user
UserSchema.pre('save', async function hashPassword(next) {
    try {
        const user = this;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        // hash the password along with our new salt
        const hash = await bcrypt.hash(user.password, saltRounds);
        
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
    //get all users
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await User.find()
                    .select("-password -__v"); //select attributes except for these 2
                
                console.log("SUCCESS! Result", users);
                resolve(users);
            } catch (err) {
                console.error("ERROR! Could not get all users:", err);
                reject(err);
            }
        })
    },
    // get user by id
    getUserById: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await User.findOne({ _id: ObjectId(userId) }).select("-__v -password");
                
                if (!result) throw "NOT_FOUND";
                
                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch(err) {
                console.error("ERROR! Could not get user by id:", err);
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
                }).select("-password -__v -isDeleted").limit(5);

                console.log("SUCCESS! Result", users);
                resolve(users);
            } catch (err) {
                console.error("ERROR! Could not search user by email:", err);
                reject(err);
            }
        })
    },
    // returns total users, new users per week etc. discuss ltr
    viewUserStats: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const totalUsers = await User.countDocuments({});
                // const totalUsers = await User.aggregate.count("email");

                if (!totalUsers) throw "UNEXPECTED_ERROR";
                
                console.log("SUCCESS! Result", totalUsers);
                resolve({ totalUsers });
            } catch (err) {
                console.error("ERROR! Could not get user stats:", err);
                reject(err)
            }
        })
    },
    // signup
    // exp_points, rank_level, token optional
    addNewUser: (first_name, last_name, email, password, gender, role, school, grade, exp_points = 0, rank_level = 0, token = 0) => {
        return new Promise(async (resolve, reject) => {
            try {
                //check if email or username exists
                const emailExists = await User.findOne({ email }).exec();
                if (emailExists) throw "EMAIL_EXISTS";

                let newUser;

                // save user if email is unique
                if(role == "student")
                    newUser = new User({ first_name, last_name, email, password, gender, role, school, grade, exp_points, rank_level, token });
                else
                    newUser = new User({ first_name, last_name, email, password, gender, role, school, grade });
                const result = await newUser.save();

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error("ERROR! Could not add new user:", err);
                reject(err);
            }
        })
    },
    // login
    verifyUser: (email, password) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await User.findOne({ email })
                    .select("-__v") // exclude __v from result
                    .exec();
                if (!user) throw "NO_MATCH";

                const match = await bcrypt.compare(password, user.password);
                if (!match) throw "NO_MATCH";

                // remove password before returning
                user.password = undefined;

                console.log("SUCCESS! Result", user);
                resolve(user);
            } catch (err) {
                console.error("ERROR! Failed to verify user:", err);
                reject(err);
            }
        })
    },
    //updates user based on fields given
    updateProfile: (userId, changedFields) => {
        return new Promise(async (resolve, reject) => {

            try {
                // const result = await User.findOneAndUpdate(
                //     { _id: ObjectId(userId)}, 
                //     { $set: changedFields }, 
                //     { new: true } 
                // ).select("-__v");

                let user = await User.findOne({ _id: ObjectId(userId) });

                if (!user) throw "NOT_FOUND";

                // if role is not specified and original role is student,
                // rm all student attributes from db
                // & reject any user attributes in the changes
                if(!changedFields.role && user.role != "student") {
                    studentExclusive.forEach(property => {
                        // remove student attributes
                        changedFields[property] = undefined;
                        user[property] = undefined;
                    });
                }
                // if role is specified in the changes and does not match db
                else if(changedFields.role && (changedFields.role != user.role)) {
                    // if role changing from student to smt else
                    if(changedFields.role != "student") {
                        // remove student attributes
                        studentExclusive.forEach(property => {
                            changedFields[property] = undefined;
                            user[property] = undefined;
                        });
                    }
                    // if role is changing to student
                    else {
                        studentExclusive.forEach(property => {
                            const fieldExists = changedFields[property];

                            // throws error if required student attributes not defined
                            if(!fieldExists && (property == "school" || property == "grade"))
                                throw "INVALID_REQUEST";
                            
                            else if(!fieldExists && (property == "exp_points" || property == "rank_level" || property == "token")) {
                                changedFields[property] = 0; // set default value of exp/rank/tokens to 0
                            }
                        });
                    }
                }
                
                console.log("Updating:", changedFields)

                // updating changed user fields
                for(property in changedFields) {
                    user[property] = changedFields[property];
                };

                const result = await user.save();
                if(!user) throw "UNEXPECTED_ERROR";

                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Failed to update user with id ${userId}: ${err}`);
                reject(err);
            }
        })
    },
    //delete user
    // TODO: do we need to delete user from all existing groups too?
    deleteUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await User.findByIdAndDelete(ObjectId(userId));

                if (!result) throw "NOT_FOUND";
                
                console.log("SUCCESS! Result", result);
                resolve(result);
            } catch (err) {
                console.error(`ERROR! Failed to delete user account with id ${userId}`);
                reject(err);
            }
        })
    },
    // populate user db with sample data
    populateUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await User.deleteMany({});

                if (!result) throw "UNEXPECTED_ERROR";
                console.log("SUCESS! Result", result);

                const addUsers = require('../datasheets/users.json');
                console.log(addUsers)
                addUsers.forEach(async user => {
                    user._id = ObjectId(user._id)
                    user.created_at = Date(user.created_at)
                    const newUser = new User(user);
                    await newUser.save();
                })
                // const result2 = await User.insertMany(addUsers);

                console.log("SUCCESS! Result", addUsers);
                resolve(addUsers);
            } catch (err) {
                console.error(`ERROR! Could not populate users to its default: ${err}`);
                reject(err);
            }
        })
    },
}


module.exports = userModel;