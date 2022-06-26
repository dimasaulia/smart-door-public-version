require("dotenv").config();
const jwt = require("jsonwebtoken");
const maxAge = 3 * 24 * 60 * 60; // 3 days

const expTime = () => {
    return maxAge;
};

const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: Number(process.env.MAX_AGE) || Number(expTime()),
    });
};

const getToken = (req) => {
    return req.cookies.jwt;
};

const getUser = (req) => {
    const UUID = jwt.verify(
        getToken(req),
        process.env.SECRET,
        (err, decode) => {
            return decode.id;
        }
    );
    return UUID;
};

const setCookie = ({ res, data }) => {
    res.cookie("jwt", data, { httpOnly: true, maxAge: expTime() * 1000 });
};

const setAuthCookie = ({ res, uuid }) => {
    res.cookie("jwt", createToken(uuid), {
        httpOnly: true,
        maxAge: expTime() * 1000,
    });
};

module.exports = {
    createToken,
    expTime,
    getToken,
    getUser,
    setCookie,
    setAuthCookie,
};
