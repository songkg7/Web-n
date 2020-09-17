const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const bodyParser = require("body-parser");
const compression = require("compression");
const topicRouter = require("./routes/topic");
const indexRouter = require("./routes/index");
const helmet = require("helmet");

app.use(helmet());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get("*", (req, res, next) => {
  fs.readdir("./data", (err, filelist) => {
    req.list = filelist;
    next();
  });
});

app.use("/", indexRouter);
app.use("/topic", topicRouter);

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
