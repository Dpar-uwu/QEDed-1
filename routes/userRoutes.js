const user = require("../model/userModel");

const express = require("express");
const router = express.Router();


router.route("/")
    // .get((req, res, next) => {
    //     //middleware e.g. validation
    //     res.send("GET request successful");
    // })
    .get(user.getAllUsers)
    .post((req, res) => {
        res.send("POST request successful");
    });


router.route("/updateProfile")
    .put(user.updateProfile);

router.route("/signup")
    .post(user.addNewUser);

router.route("/login")
    .post(user.verifyUser);

module.exports = router;