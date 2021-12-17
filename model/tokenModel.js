const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const { UserSchema } = require("./userModel");
const User = mongoose.model("User", UserSchema);

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const sendEmail = require('../email/email');
const { QuizSchema } = require("./quizModel");
const Quiz = mongoose.model("Quiz", QuizSchema)

const bcryptSalt = process.env.BCRYPT_SALT;

const schedule = require('node-schedule');

const TokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,// this is the expiry time in seconds
    },
});

const Token = mongoose.model("Token", TokenSchema);

const tokenModel = {
    TokenSchema,
    requestPasswordReset: (email) => {
        return new Promise(async (resolve, reject) =>{
            try{
                const user = await User.findOne({ email });
                console.log("i am user", user);
                if (!user) throw "NOT_FOUND";
        
                let token = await Token.findOne({ userId: user._id });
        
                if (token) await token.deleteOne();

                let resetToken = crypto.randomBytes(32).toString("hex");
                const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
        
                await new Token({
                    userId: user._id,
                    token: hash,
                    createdAt: Date.now(),
                }).save();
                
                const link = `/resetPassword.html?token=${resetToken}&id=${user._id}`;
                sendEmail(user.email, "Password Reset Request", { name: user.first_name, link: link, }, "../email/template/requestResetPassword.handlebars");
                
                resolve(link);
            }
            catch(err){
                console.log(err);
                console.log(err.message);
                reject(err);
            }

        })
    },

    progressupdate: () => {
        return new Promise(async (resolve, reject) =>{
            try{
                const user = await User.find({ 'role': 'student' });
                console.log(user);
                if (!user) throw "NOT_FOUND";

                for (let i=0; i<user.length; i++){
                    const done_by = user[i]._id;
                    const quizdone = await Quiz.find({ done_by, 'created_at': {$lt: new Date(), $gt: new Date(new Date().getTime() - (168*60*60*1000))} }).lean()
                    if (quizdone.length === 0){
                        sendEmail(user[i].email, "Progress Update", 
                         { name: user[i].first_name }, 
                         "../email/template/progressupdateNOQUIZ.handlebars");
                    }
                    else {
                         sendEmail(user[i].email, "Progress Update", 
                         { name: user[i].first_name, quiz: quizdone }, 
                         "../email/template/progressupdate.handlebars");
                    }
                }

            }
            catch(err){
                console.log(err);
                console.log(err.message);
                reject(err);
            }

        })
    },

    resetPassword: (userId, token, password) => {
        return new Promise(async (resolve, reject) =>{
            try{
                let passwordResetToken = await Token.findOne({ userId });
                
                if (!passwordResetToken) {
                    throw Error("Invalid or expired password reset token");
                }
                
                const isValid = await bcrypt.compare(token, passwordResetToken.token);
                
                if (!isValid) {
                    throw Error("Invalid or expired password reset token");
                }
                
                const hash = await bcrypt.hash(password, Number(bcryptSalt));
                
                await User.updateOne(
                    { _id: userId },
                    { $set: { password: hash } },
                    { new: true }
                );
                
                await passwordResetToken.deleteOne();
                resolve();
            }
            catch(err){
                reject(err);
            }
        })
    }
}
module.exports = tokenModel;