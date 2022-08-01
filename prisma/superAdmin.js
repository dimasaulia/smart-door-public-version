const { encryptPassword } = require("../services/auth");

const role = [
    {
        name: "USER",
    },
    {
        name: "ADMIN",
    },
];

const user = [
    {
        username: "dimasaulia",
        email: "dimasauliafachrudin@gmail.com",
        password: encryptPassword("12345678"),
        role: "ADMIN",
    },
];

module.exports = { user, role };
