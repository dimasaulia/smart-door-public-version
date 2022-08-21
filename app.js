if (process.env.NODE_ENV !== "PRODUCTION") require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const path = require("path");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const expbs = require("express-handlebars");
app.io = io;

/*
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "views"));
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 50);
});
app.use(connectLiveReload());
*/
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));
app.use("/static", express.static("public"));
// app.use(
//     express.session({
//         secret: "somethingtobesecret",
//     })
// );
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
