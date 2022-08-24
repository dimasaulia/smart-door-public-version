const { hasher } = require("../services/auth");

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
        password: hasher("12345678"),
        role: "ADMIN",
    },
];

module.exports = { user, role };
