const { request } = require("express");

module.exports.home = (req, res) => {
    const data = {
        layout: "userBase",
        card: "bg-neutral-4",
        styles: ["/style/userCardList.css"],
        scripts: ["/js/userCardList.js"],
    };
    res.render("user", data);
};

module.exports.cardLogs = (req, res) => {
    const { id } = req.params;
    const data = {
        layout: "userBase",
        card: "bg-neutral-4",
        styles: ["/style/userCardLogs.css"],
        scripts: ["/js/userCardLogs.js"],
        id,
    };
    res.render("userCardLogs", data);
};

module.exports.cardRoom = (req, res) => {
    const { card: id } = req.params;
    const data = {
        layout: "userBase",
        card: "bg-neutral-4",
        styles: ["/style/userCardLogs.css", "/style/userCardRoom.css"],
        scripts: ["/js/userCardRoom.js"],
        id,
    };
    res.render("userCardRoom", data);
};
