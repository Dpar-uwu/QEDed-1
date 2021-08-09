/**
 * JWT best practices - https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/
 * Signing algo - https://www.scottbrady91.com/JOSE/JWTs-Which-Signing-Algorithm-Should-I-Use
 */
const { sign } = require("jsonwebtoken");

const createAccessToken = (sub, issuedRole) => {
    const payload = {
        sub,
        issuedRole
    };
    const options = {
        expiresIn: '15m'
    };
    return sign(payload, process.env.ACCESS_TK_MIMI, options);
};

const createRefreshToken = (sub, issuedRole, rememberMe) => {
    const payload = {
        sub,
        issuedRole
    };
    const options = {
        expiresIn: rememberMe
    };
    return sign(payload, process.env.REFRESH_TK_MIMI, options);
};

module.exports = {
    createAccessToken,
    createRefreshToken
}