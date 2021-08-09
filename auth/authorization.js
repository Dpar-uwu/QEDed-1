const { verify } = require("jsonwebtoken");
const path = require("path");

const isAuth = (req, res, next) => {
    const authorization = req.headers["authorization"];
    // authorization header: "Bearer <token>"
    // extract to get token
    const authBearer = authorization && authorization.split(" ");
    console.log(authBearer)
    try {
        // if auth not bearer or no authBearer
        if(!authBearer) throw "UNAUTHENTICATED_USER";
        if(authBearer[0] != "Bearer" || !authBearer[1] || authBearer[1] == null) throw "UNAUTHENTICATED_USER";
        
        const token = authBearer[1];
        // verify access token
        verify(token, process.env.ACCESS_TK_MIMI, (err, payload) => {
            if (err) {
                console.log(err)
                throw "UNAUTHORIZED_USER";
            } else {
                req.userId = payload.sub; 
                req.role = payload.issuedRole;
                
                next(); // if no err go to next function
            }
        });
    } catch(err) {
        console.log("Error!", err);
        if(err == "UNAUTHENTICATED_USER")
            // return res.status(401).sendFile(path.resolve("public/login.html"))
            return res.status(401).send({ error: "User not logged in", code: err });
        else if(err == "UNAUTHORIZED_USER") {
            console.log(path.resolve("public/403.html"))
            // return res.status(403).sendFile(path.resolve("public/403.html"));
            return res.status(403).send({ error: "User does not have permission to access this page", code: err });
        }
    }
}

const isAdmin = (req, res, next) => {
    const { role } = req;
    if(role=="admin") {
        next();
    }
    else {
        console.log("Error! User is not an admin and cannot view the page");
        return res.status(403).send({ error: "User does not have permission to access this page", code: "UNAUTHORIZED_USER" });
    }

}

module.exports = {
    isAuth,
    isAdmin
}