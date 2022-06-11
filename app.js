require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
app.io = io;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use("/static", express.static("public"));
app.set("views", "views");
app.set("view engine", "hbs");

const PORT = process.env.PORT || 8080;
const ROUTER = require("./router");

app.get("/", (req, res) => {
    res.status(200).send({ msg: "Server is work 🤘" });
});

app.use("/", ROUTER);

io.on("connection", (socket) => {
    console.log("A client connected 🚀");
    socket.on("disconnect", () => {
        console.log("A client disconnected 📡");
    });
});

http.listen(PORT, () => {
    console.log(`🤘 SERVER RUNNING IN PORT ${PORT}`);
});
