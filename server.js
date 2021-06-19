require('dotenv').config()

var app = require('./controller/app.js');
var port = process.env.NODE_ENV === 'production' ?
    process.env.PRODUCTION_PORT
    : process.env.DEVELOPMENT_PORT;

const server = app.listen(port, () => {
    console.log("Server is listening on localhost:" + server.address().port);
})
