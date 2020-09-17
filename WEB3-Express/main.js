const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const template = require("./lib/template.js");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const bodyParser = require("body-parser");
var compression = require("compression");

app.use(bodyParser.urlencoded({ extended: false })); // 미들웨어
app.use(compression());
app.get("*", function (req, res, next) {
  fs.readdir("./data", (err, filelist) => {
    req.list = filelist;
    next();
  });
});

//route, routing
app.get("/", (req, res) => {
  let title = "Welcome";
  let description = "Hello, Node.js";
  let list = template.list(req.list);
  let html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}`,
    `<a href="/create">create</a>`
  );
  res.send(html);
});

app.get("/page/:pageId", (req, res) => {
  let filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
    let title = req.params.pageId;
    let sanitizedTitle = sanitizeHtml(title);
    let sanitizedDescription = sanitizeHtml(description, {
      allowedTags: ["h1"],
    });
    let list = template.list(req.list);
    let html = template.HTML(
      sanitizedTitle,
      list,
      `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
      ` <a href="/create">create</a>
          <a href="/update/${sanitizedTitle}">update</a>
          <form action="/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
    );
    res.send(html);
  });
});

app.get("/create", (req, res) => {
  let title = "WEB - create";
  let list = template.list(req.list);
  let html = template.HTML(
    title,
    list,
    `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `,
    ""
  );
  res.send(html);
});

app.post("/create_process", (req, res) => {
  let post = req.body;
  let title = post.title;
  let description = post.description;
  fs.writeFile(`data/${title}`, description, "utf8", (err) => {
    res.writeHead(302, { Location: `/?id=${title}` });
    res.end();
  });
});

app.get("/update/:pageId", (req, res) => {
  let filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
    let title = req.params.pageId;
    let list = template.list(req.list);
    let html = template.HTML(
      title,
      list,
      `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
      `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
    );
    res.send(html);
  });
});

app.post("/update_process", (req, res) => {
  let post = req.body;
  let id = post.id;
  let title = post.title;
  let description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, (err) => {
    fs.writeFile(`data/${title}`, description, "utf8", (err) => {
      res.redirect("/?id=${title}");
    });
  });
});

app.post("/delete_process", (req, res) => {
  let post = req.body;
  let id = post.id;
  let filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, (err) => {
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// var http = require("http");
// var url = require("url");

// var app = http.createServer(function (req, response) {
//   var _url = request.url; // 주소를 가져온다
//   var queryData = url.parse(_url, true).query;
//   var pathname = url.parse(_url, true).pathname;
//   if (pathname === "/") {
//     if (queryData.id === undefined) {
//
//     } else {
//
//     }
//   } else if (pathname === "/create") {
//
//   } else if (pathname === "/create_process") {
//
//   } else if (pathname === "/update") {
//
//   } else if (pathname === "/update_process") {
//
//   } else if (pathname === "/delete_process") {
//
// });
// app.listen(3000);
