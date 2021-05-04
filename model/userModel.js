/**
 * User schema object with functions to interact with MongoDB
 * user password hashed with bcrypt
 * 
 * TODO: Improve error handling
 * TODO: Add validation and sanitisation
 * 
 * If there are Mongoose deprecation warnings, go to 
 * https://mongoosejs.com/docs/deprecations.html to rectify
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;
const bcrypt = require('bcrypt');
const saltRounds = 10;

// const { AssignmentSchema } = require("./assignmentModel");

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
    username: {
        type: String,
        required: "Please enter Username",
        index: true,
        unique: true
    },
    password: {
        type: String,
        required: "Please enter Password"
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: "Please enter Email"
    },
    role: {
        type: String,
        lowercase: true,
        required: "Please enter Role",
        enum: [ "student", "teacher", "parent", "admin" ]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    school: {
        type: String
    },
    age: {
        type: Number
    },
    grade: {
        type: Number,
        min: 1,
        max: 6
    },
    assignments: [],
    exp_points: {
        type: Number,
        default: 0
    },
    rank_level: {
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
    UserSchema: UserSchema,
    // signup
    // TODO: check if email exists
    addNewUser: async (req, res) => {
        const { first_name, last_name, email, username, password, role, school, age, grade } = req.body;

        try {
            //check if email or username exists
            const emailExists = await User.findOne({ email: email }).exec();
            const usernameExists = await User.findOne({ username: username }).exec();

            if(emailExists) {
                res.status(400).json({ message: "Email already exists" });
            }
            else if(usernameExists) {
                res.status(400).json({ message: "Username already exists" });
            }
            else {
                // save user if email is unique
                const newUser = new User(req.body);
                const result = await newUser.save();

                if(!result) {
                    throw "Failed to create user";
                }
                res.status(201).json({ message: "User Created"});
            }            
        } catch(err) {
            console.error(err);
            res.status(500).send({ error: err });
        }
    },
    // login
    verifyUser: async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await User.findOne({ username: username }).exec();

            if(!user) 
                res.status(400).send({ error: "The email or password is invalid" });
            else if(!bcrypt.compare(password, user.password))
                res.status(400).send({ error: "The email or password is invalid" });
            else {
                delete user.password;
                delete user.__v;
                delete user._id;

                console.error(user);
                res.status(200).json(user);
            }
                

        } catch(err) {
            console.error(err);
            res.status(500).send(err);
        }
    },
    //get all users
    // TODO: remove password before sending
    getAllUsers: async (req, res) => {
        try {
            const result = await User.find();

            if(!result) {
                throw "Failed to get user"
            }
            res.status(200).send(result);
        } catch(err) {
            console.error(err);
            res.status(500).send({ error: err });
        }
    },
    // returns total users, new users per week etc. discuss ltr
    viewUserStats: async (req, res) => {
        try {
            const result = await User.countDocuments({});

            res.status(200).send({ total_users: result });
        } catch(err) {
            console.error(err);
            res.status(500).send({ error: err });
        }
    },
    updateProfile: async (req, res) => {

        const changedFields = {...req.body};
        const { userId } = req.body;

        // remove id from changedFields
        console.log(changedFields);

        // delete userId from request
        delete changedFields.userId;

        try {
            const result = await User.findByIdAndUpdate( ObjectId(userId), changedFields);
            if(result) res.status(200).send({ message: "Updated" });
            else throw "User could not be updated";
        } catch(err) {
            console.error(err);
            res.status(500).send({ error: err });
        }
    }
}


module.exports = userModel;