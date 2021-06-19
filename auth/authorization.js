const { verify } = require("jsonwebtoken");

const isAuth = (req, res, next) => {
    const authorization = req.headers["authorization"];
    // authorization header: "Bearer <token>"
    // extract to get token
    const authBearer = authorization && authorization.split(" ");
    console.log(authBearer)
    try {
        // if auth not bearer or no authBearer
        if(!authBearer || authBearer[0] != "Bearer" || !authBearer[1]) throw "UNAUTHENTICATED_USER";

        const token = authBearer[1];
        // verify access token
        verify(token, process.env.ACCESS_TK_MIMI, (err, payload) => {
            if (err) {
                console.log(err)
                throw "UNAUTHORIZED_USER";
            } else {
                // "msg": {"sub" (short for subject, contains user id), "issuedRole", "iat", "exp"}
                // store in req
                req.userId = payload.sub; 
                req.role = payload.issuedRole;
                
                next(); // if no err go to next function
            }
        });
    } catch(err) {
        if(err == "UNAUTHENTICATED_USER")
            return res.status(401).send({ error: "User not logged in", code: err });
        else if(err == "UNAUTHORIZED_USER")
            return res.status(403).send({ error: "User does not have permission to access this page", code: err });
    }
}

module.exports = {
    isAuth
}