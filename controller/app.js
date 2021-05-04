const mongoose = require("mongoose");
const express = require("express");

const userRoutes = require("../routes/userRoutes");
const app = express();

app.use(express.json()); // expect json in http req
app.use(express.urlencoded({ extended: false }));


// app.use('/static', express.static(path.join(__dirname, 'public')))

/* Connect to MondoBD Instance */
const url = process.env.CONNECTION_STRING;
const localurl = "mongodb://localhost:27017/"+ process.env.DATABASE_CLUSTER;

const options = {
    useNewUrlParser: true, // avoid deprecation when connecting
    useUnifiedTopology: true,
    useCreateIndex: true, // avoid deprecation for index when defining schema
    useFindAndModify: false // avoid deprecation for findOneAndUpdate()
};

// (func() {...})() is an Immediately Invoked Function Expression
(async () => {
    try {
        const connection = await mongoose.connect(localurl, options)
        console.log("Connected to database");
    } catch(error) {
        console.error(error);
    }
})();

// handle any transaction error to mongodb
mongoose.connection.on('error', err => {
    console.error(err);
});



/********** Routes **********/ 
app.use("/user", userRoutes);


// to handle paths that do not exist
app.all("*", (req, res) => {
    res.status(404).send("Page not found");
})



module.exports = app;