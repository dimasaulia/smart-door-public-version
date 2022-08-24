require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const maxAge = 3 * 24 * 60 * 60; // 3 days
const saltRounds = 10;

/**  Createing max age of a token, changeable from variable or env var*/
const expTime = () => {
    return maxAge;
};

/** Creating jwt token*/
const createJwtToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: Number(process.env.MAX_AGE) || Number(expTime()),
    });
};

/**  Getting jwt token from request */
const getJwtToken = (req) => {
    try {
        return decrypter(req.cookies.jwt);
    } catch (error) {
        return false;
    }
};

/** Get uuid from req */
const getUser = (req) => {
    const UUID = jwt.verify(
        getJwtToken(req),
        process.env.SECRET,
        (err, decode) => {
            return decode.id;
        }
    );
    return UUID;
};

/** Set Cookie To User Browser */
const setCookie = ({ res, title, data }) => {
    res.cookie(title, encrypter(data), {
        httpOnly: true,
        maxAge: expTime() * 1000,
    });
};

const getCookie = ({ res, title }) => {
    return;
};

/** Set authentication cookie */
const setAuthCookie = ({ res, uuid }) => {
    setCookie({ res, title: "jwt", data: createJwtToken(uuid) });
};

/**
 * Function to hash input number or string.
 * @param {string} text Input string to hash.
 * */
const hasher = (text) => {
    const hashPassword = bcrypt.hashSync(text, bcrypt.genSaltSync(saltRounds));
    return hashPassword;
};

/**
 * Funstion to check hash text with the original plain text, wil return boolean.
 * @param {string} password Plain text to check
 * @param {string} hashPassword Hash text to validate the plain text
 * @returns {boolean} return boolean value
 */
const hashChecker = (password, hashPassword) => {
    const isTruePassword = bcrypt.compareSync(password, hashPassword);
    return isTruePassword;
};

/**
 * Function to encrypt input  string.
 * @param {string} text Input string to encyript.
 * */
const encrypter = (text) => {
    var ciphertext = CryptoJS.AES.encrypt(text, process.env.SECRET).toString();
    return ciphertext;
};

/**
 * Function to decrypt input string.
 * @param {string} text Input string to decyript.
 * */
const decrypter = (text) => {
    var bytes = CryptoJS.AES.decrypt(text, process.env.SECRET);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
};

module.exports = {
    createJwtToken,
    expTime,
    getJwtToken,
    getUser,
    setCookie,
    setAuthCookie,
    hasher,
    hashChecker,
    encrypter,
    decrypter,
};
