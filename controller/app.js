var connection;
const mongoose = require("mongoose");
const express = require("express");

const userController = require("./userController.js");
const levelController = require("./levelController.js");
const topicController = require("./topicController.js");
const skillController = require("./skillController.js");
const quizController = require("./quizController.js");
const questionController = require("./questionController.js");

const app = express();

// cors middleware
var cors = require('cors');
app.options('*',cors());
app.use(cors());

// json middleware
// app.use(express.json()); // expect json in http req
app.use(express.json({
    verify : (_req, res, buf, _encoding) => {
      try {
        JSON.parse(buf);
      } catch(e) {
        return res.status(400).send({ error:"Invalid Request Body", code: "INVALID_JSON_BODY" });
      }
    }
  }));
app.use(express.urlencoded({ extended: false }));

// cookie parser middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

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
    } catch (error) {
        console.error("ERROR Error connecting to database");
        process.exit(1);
    }
})();

// handle any transaction error to mongodb
mongoose.connection.on('error', err => {
    console.error("Database error");
});



/**
 * Routes
 */
// user routes
app.use("/user", userController);

// syllabus routes
app.use("/level", levelController);
app.use("/topic", topicController);
app.use("/skill", skillController);

// quiz routes
app.use("/quiz", quizController);
app.use("/question", questionController);

// only for resetting database
app.post('/reset', async (req, res) => {
    try {
        console.log("Deleting tables");

        //drop collections here
        await connection.connection.db.dropCollection("users");
        // await connection.connection.db.dropCollection("levels");
        

        res.status(200).send({ message: "Reset OK" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
    }
});

// error handling
app.use((_error, _req, res, _next) => {
    // Any request to this server will get here, and will send an HTTP
    // response with the error message 'woops'
    res.status(500).send({ error: "An error occured", code: "UNEXPECTED_ERROR" });
});


// to handle 404 paths that do not exist
app.all("*", (_req, res) => {
    res.status(404).send({ error: "Page not found", code: "NOT_FOUND" });
});

// handle unhandledrejection to prevent program from breaking
process.on('unhandledRejection', error => {
    console.log('WARNING! unhandledRejection', error);
});


module.exports = app;