module.exports.home = (req, res) => {
    const data = {
        layout: "userBase",
        card: "bg-neutral-4",
        styles: ["/style/userCardList.css"],
        scripts: ["/js/userCardList.js"],
    };
    res.render("user", data);
};
