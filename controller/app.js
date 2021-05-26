var connection;
const mongoose = require("mongoose");
const express = require("express");

const userController = require("./userController.js");
const topicController = require("./topicController.js");
const app = express();

app.use(express.json()); // expect json in http req
app.use(express.urlencoded({ extended: false }));

// host web pages
app.use(express.static('public'));

/* Connect to MondoBD Instance */
const localurl = process.env.CONNECTION_STRING || "mongodb://localhost:27017/" + process.env.DATABASE_CLUSTER;

const options = {
    useNewUrlParser: true, // avoid deprecation when connecting
    useUnifiedTopology: true,
    useCreateIndex: true, // avoid deprecation for index when defining schema
    useFindAndModify: false // avoid deprecation for findOneAndUpdate()
};

// (func() {...})() is an Immediately Invoked Function Expression
(async () => {
    try {
        connection = await mongoose.connect(localurl, options);
        console.log("SUCCESS Connected to database");
    } catch(error) {
        console.error("ERROR Error connecting to database");
        process.exit(1);
    }
})();

// handle any transaction error to mongodb
mongoose.connection.on('error', err => {
    console.error("Database error");
});



/********** Routes **********/ 
app.use("/user", userController);
app.use("/topic", topicController);

// only for resetting database
app.post('/reset', async (req, res) => {
    try {
        console.log("Deleting tables");

        //drop collections here
        await connection.connection.db.dropCollection("users");
        await connection.connection.db.dropCollection("topics");
        
        res.status(200).send({message: "Reset OK"});
    } catch(err) {
        console.log(err);
        res.status(500).send({error: err});
    }
});

// to handle 404 paths that do not exist
app.all("*", (req, res) => {
    res.status(404).send("404 Page not found");
});



module.exports = app;