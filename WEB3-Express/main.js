const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const bodyParser = require("body-parser");
const compression = require("compression");
const session = require("express-session");
// const FileStore = require("session-file-store")(session);
const LokiStore = require("connect-loki")(session);
const helmet = require("helmet");
const db = require("./lib/db");

app.use(helmet());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(
  session({
    HttpOnly: true,
    secure: true, // https 로 설정
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: new LokiStore(),
  })
);

const passport = require("./lib/passport")(app);
const flash = require("connect-flash");
const indexRouter = require("./routes/index");
const topicRouter = require("./routes/topic");
const authRouter = require("./routes/auth")(passport);

app.use(flash());

app.get("*", (req, res, next) => {
  req.list = db.get("topics").value();
  next();
});

app.use("/", indexRouter);
app.use("/topic", topicRouter);
app.use("/auth", authRouter);

app.use((req, res, next) => {
  res.status(404).send("Sorry cant find that!");
});

// Error Handlers
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
