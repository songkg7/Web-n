const express = require("express");
const parseurl = require("parseurl");
const session = require("express-session");
const app = express();
const FileStore = require("session-file-store")(session);

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
  })
);

app.get("/", (req, res, next) => {
  if (req.session.num === undefined) {
    req.session.num = 1;
  } else {
    req.session.num = req.session.num + 1;
  }
  res.send(`Views : ${req.session.num}`);
});

app.listen(3000, () => console.log("3000!"));
