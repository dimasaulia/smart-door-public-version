module.exports.login = (req, res) => {
    const data = {
        styles: ["/style/auth.css"],
        scripts: ["/js/login.js"],
        layout: "auth.hbs",
    };
    res.render("login", data);
};

module.exports.register = (req, res) => {
    const data = {
        styles: ["/style/auth.css"],
        scripts: ["/js/register.js"],
        layout: "auth.hbs",
    };
    res.render("register", data);
};

module.exports.forget = (req, res) => {
    const data = {
        styles: ["/style/auth.css"],
        scripts: ["/js/forgot.js"],
        layout: "auth.hbs",
    };
    res.render("forgetpassword", data);
};
