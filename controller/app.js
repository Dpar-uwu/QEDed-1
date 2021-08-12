var connection;
const isDevelopment = process.env.NODE_ENV === 'development';
const path = require('path');

const mongoose = require("mongoose");
const express = require("express");

const userController = require("./userController.js");
const levelController = require("./levelController.js");
const topicController = require("./topicController.js");
const skillController = require("./skillController.js");
const quizController = require("./quizController.js");
const questionController = require("./questionController.js");
const groupController = require("./groupController.js");
const { router, postSocket, updatePostSocket, deletePostSocket } = require("./postController.js");
const postController = router;
const assignmentController = require('./assignmentController');
const notificationController = require('./notificationController');


// const email = require("../email/email");
const app = express();

// cookie parser middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// cors middleware
const cors = require('cors');
app.options('*', cors());
app.use(cors({
    credentials: true,
    origin: true,
    methods: ['GET', 'PUT', 'POST', "DELETE"],
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
}));


// json middleware
app.use(express.json({
    verify: (_req, res, buf, _encoding) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            // returns error if body is not json
            return res.status(400).send({ error: "Invalid Request Body", code: "INVALID_JSON_BODY" });
        }
    }
}));
app.use(express.urlencoded({ extended: false }));


/* host web pages */
app.use(express.static('public'));

/* Connect to MondoBD Instance */
const localurl = isDevelopment ? ("mongodb://localhost:27017/" + process.env.DATABASE_CLUSTER) : process.env.CONNECTION_STRING;
const options = {
    useNewUrlParser: true, // avoid deprecation when connecting
    useUnifiedTopology: true,
    useCreateIndex: true, // avoid deprecation for index when defining schema
    useFindAndModify: false // avoid deprecation for findOneAndUpdate()
};

// run database connect
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
    console.log("\x1b[43m\x1b[30m", req.method, "\x1b[0m\x1b[1m", req.path, "\x1b[0m");
    if (Object.keys(req.query).length !== 0)
        console.log("\x1b[34mquery:\x1b[0m", req.query);
    if (Object.keys(req.body).length !== 0)
        console.log("\x1b[34mbody:\x1b[0m", req.body);
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

// group routes
app.use("/group", groupController);
app.use("/post", postController);
app.use('/assignment', assignmentController);

// notification routes
app.use("/notification", notificationController);

// uncaught error handling
app.use((_error, _req, res, _next) => {
    // Any request to this server will get here, and will send an HTTP
    res.status(500).send({ error: "An error occured", code: "UNEXPECTED_ERROR" });
});


// to handle paths that do not exist
app.all("*", (_req, res) => {
    res.status(404).sendFile(path.resolve("public/404.html"))
});


/**
 * WEBSOCKET
 */
const WebSocket = require("ws");
let client = {};

const socketListener = (server) => {
    var socket = new WebSocket.Server({ server });

    socket.on("connection", connection = (ws) => {
        console.log("A user is connected");

        ws.on("message", async message => {
            let msg = JSON.parse(message);
            console.log("Socket Request", msg);
            switch (msg.action) {
                case "message": {
                    try {
                        const new_id = await postSocket(msg);
                        
                        if (new_id) {
                            msg.post._id = new_id;
                            Object.entries(client[msg.group_id]).forEach(([ahh, sock]) => {
                                sock.send(JSON.stringify(msg));
                            });
                        }
                    } catch(err) {
                        console.log(err)
                    }
                    break;
                }
                case "join": {
                    let group_id = msg.group_id;
                    let user_id = msg.user_id;

                    // if group not exists, create one
                    if (!client[group_id]) client[group_id] = {};

                    // if same user makes another connection to the same group, the previous connection will be alerted then overwritten
                    if (client[group_id][user_id]) {
                        console.log("The user's connection to the group already exists");
                        let data = {
                            action: "duplicate member"
                        };
                        client[group_id][user_id].send(JSON.stringify(data));
                    }
                    client[group_id][user_id] = ws;
                    break;
                }
                case "update message": {
                    try {
                        const result = await updatePostSocket(msg.postId, msg.content);

                        if (result) {
                            Object.entries(client[msg.group_id]).forEach(([ahh, sock]) => {
                                sock.send(message);
                            });
                        }
                    } catch(err) {
                        console.log(err)
                    }
                    break;
                }
                case "delete message": {
                    try {
                        const result = await deletePostSocket(msg.postId);

                        if (result) {
                            Object.entries(client[msg.group_id]).forEach(([ahh, sock]) => {
                                sock.send(message);
                            });
                        }
                    } catch(err) {
                        console.log(err)
                    }
                    break;
                }
                case "leave": {
                    let group_id = msg.group_id;
                    let user_id = msg.user_id;
                    console.log(user_id, "leaving group");
                    if (!client[group_id][user_id]) return; // not not in group do nothing

                    // if the one exiting is the last one, destroy the group
                    if (Object.keys(client[group_id]).length === 1) delete client[group_id];
                    
                    else delete client[group_id][user_id];// otherwise simply leave the group
                }
            }

        });
        ws.on("error", error => {
            console.log("WEBSOCKET ERROR:", error);
        });
        ws.on("close", () => {
            console.log("Client Connection Closed");
        })
    });
};


// handle unhandledrejection to prevent program from breaking
process.on('unhandledRejection', error => {
    console.log('\x1b[31mWARNING! unhandledRejection\x1b[0m', error);
});


module.exports = { app, socketListener };