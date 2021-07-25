require('dotenv').config()

var app = require('./controller/app.js');
const isDevelopment = process.env.NODE_ENV === 'development';

var port = isDevelopment ? process.env.DEVELOPMENT_PORT : process.env.PRODUCTION_PORT;
var domain = isDevelopment ? ("localhost"+":"+port) : process.env.DOMAIN_NAME;
    
const server = app.listen(port, () => {
    console.log("Server is listening on " + domain );
})
