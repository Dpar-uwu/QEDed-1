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
app.options('*', cors());
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
        console.error("\x1b[31mERROR Error connecting to database\x1b[0m");
        process.exit(1);
    }
})();

// handle any transaction error to mongodb
mongoose.connection.on('error', err => {
    console.error("\x1b[31mDatabase error:", err, "\x1b[0m");
});

// logging middleware
app.use((req, _res, next) => {
    // go to for console.log font color
    // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
    console.log("\x1b[43m\x1b[30m", req.method, "\x1b[0m\x1b[1m", req.path,"\x1b[0m");
    if(Object.keys(req.query).length !== 0) console.log("\x1b[34mquery:\x1b[0m", req.query);
    if(Object.keys(req.body).length !== 0) console.log("\x1b[34mbody:\x1b[0m", req.body);
    next();
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


// error handling
app.use((_error, _req, res, _next) => {
    // Any request to this server will get here, and will send an HTTP
    res.status(500).send({ error: "An error occured", code: "UNEXPECTED_ERROR" });
});


// to handle paths that do not exist
app.all("*", (_req, res) => {
    res.status(404).send({ error: "Page not found", code: "NOT_FOUND" });
});

// handle unhandledrejection to prevent program from breaking
process.on('unhandledRejection', error => {
    console.log('\x1b[31mWARNING! unhandledRejection\x1b[0m', error);
});


module.exports = app;