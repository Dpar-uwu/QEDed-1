require('dotenv').config()

var app = require('./controller/app.js');
var port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log("Server is listening on localhost:" + server.address().port);
})
