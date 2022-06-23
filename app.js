require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const expbs = require("express-handlebars");
app.io = io;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use("/static", express.static("public"));

app.engine(
    "handlebars",
    expbs.engine({ extname: ".hbs", defaultLayout: "base" })
);
app.set("views", "views");
app.set("view engine", "handlebars");

const PORT = process.env.PORT || 8080;
const ROUTER = require("./router");

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
