require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const maxAge = 3 * 24 * 60 * 60; // 3 days
const saltRounds = 10;

// createing max age of a token, changeable from variable or env var
const expTime = () => {
    return maxAge;
};

// creating jwt token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: Number(process.env.MAX_AGE) || Number(expTime()),
    });
};

// Getting jwt token from request
const getToken = (req) => {
    return req.cookies.jwt;
};

// get uuid from req
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

const setCookie = ({ res, title, data }) => {
    res.cookie(title, data, { httpOnly: true, maxAge: expTime() * 1000 });
};

const setAuthCookie = ({ res, uuid }) => {
    res.cookie("jwt", createToken(uuid), {
        httpOnly: true,
        maxAge: expTime() * 1000,
    });
};

const encryptPassword = (password) => {
    const hashPassword = bcrypt.hashSync(
        password,
        bcrypt.genSaltSync(saltRounds)
    );
    return hashPassword;
};

const isTruePassword = (password, hashPassword) => {
    const isTruePassword = bcrypt.compareSync(password, hashPassword);
    return isTruePassword;
};

function ErrorException({ type, detail, location = "not specified" }) {
    this[`${type}`] = { type, detail, location };
}

module.exports = {
    createToken,
    expTime,
    getToken,
    getUser,
    setCookie,
    setAuthCookie,
    encryptPassword,
    isTruePassword,
    ErrorException,
};
