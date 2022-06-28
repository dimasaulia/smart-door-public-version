module.exports.home = (req, res) => {
    const data = {
        layout: "userBase",
        card: "bg-neutral-4",
        scripts: ["/js/dashboard.js"],
    };
    res.render("user", data);
};
