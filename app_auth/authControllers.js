module.exports.login = (req, res) => {
    res.render("login", { layout: false });
};

module.exports.register = (req, res) => {
    res.render("register", { layout: false });
};
