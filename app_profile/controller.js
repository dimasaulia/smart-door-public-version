const prisma = require("../prisma/client");
const { getUser } = require("../services/auth");

exports.profile = async (req, res) => {
    const id = getUser(req);
    const userData = await prisma.user.findUnique({
        where: { id },
        include: { profil: true, role: true },
    });
    const data = {
        styles: ["/style/profil.css"],
        scripts: ["/js/profil.js"],
        userData,
        avatar: userData.profil.photo || "/image/illustration-user.png",
        layout: userData.role.name === "USER" ? "userBase" : "base",
    };
    res.render("profile", data);
};