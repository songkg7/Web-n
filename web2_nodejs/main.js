var http = require("http");
var fs = require("fs"); // To control file system
var url = require("url");
var qs = require("querystring");
var template = require("./lib/template.js"); // Refactoring으로 분리한 template 모듈 호출
var path = require("path"); // 경로 입력정보에 대한 보안
var sanitizeHtml = require("sanitize-html"); // 출력정보에 대한 보안
var mysql = require("mysql");
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "black7kg",
  database: "opentutorials",
});

db.connect();

var app = http.createServer((request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      // fs.readdir("./data", (error, filelist) => {
      //   var title = "Welcome";
      //   var description = "Hello, Node.js";
      //   var list = template.list(filelist);
      //   var html = template.html(
      //     title,
      //     list,
      //     `<h2>${title}</h2>${description}`,
      //     `<a href="/create">create</a>`
      //   );

      //   response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
      //   response.end(html);
      // });
      db.query(`SELECT * FROM topic`, function (error, topics) {
        console.log(topics);
        response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
        response.end("Success");
      });
    } else {
      fs.readdir("./data", (error, filelist) => {
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
          var title = queryData.id;
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description);
          var list = template.list(filelist);
          var html = template.html(
            sanitizedTitle,
            list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            `<a href="/create">create</a>
            <a href="/update?id=${sanitizedTitle}">update</a>
            <form action = "delete_process" method = "post" onsubmit="">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`
          );

          response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
          response.end(html);
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", (error, filelist) => {
      var title = "WEB - create";
      var list = template.list(filelist);
      var html = template.html(
        title,
        list,
        `<form action="/create_process" method="post">
          <p>
            <input type="text" name="title" placeholder="title" />
          </p>
          <p>
            <textarea name="description" placeholder ="description" id="" cols="30" rows="10"></textarea>
          </p>
          <p>
            <input type="submit" />
          </p>
        </form>`,
        ""
      );

      response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
      response.end(html);
    });
  } else if (pathname === "/create_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, "utf8", (err) => {
        response.writeHead(302, {
          Location: `/?id=${title}`,
        });
        response.end();
      });
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", (error, filelist) => {
      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
        var title = queryData.id;
        var list = template.list(filelist);
        var html = template.html(
          title,
          list,
          `
          <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p>
            <input type="text" name="title" placeholder="title" value="${title}"/>
          </p>
          <p>
            <textarea 
            name="description" placeholder ="description" id="" cols="30" rows="10">${description}
            </textarea>
          </p>
          <p>
            <input type="submit" />
          </p>
        </form>
        `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );

        response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
        response.end(html);
      });
    });
  } else if (pathname === "/update_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, (error) => {
        fs.writeFile(`data/${title}`, description, "utf8", (err) => {
          response.writeHead(302, {
            Location: `/?id=${title}`,
          });
          response.end();
        });
      });
      console.log(post);
    });
  } else if (pathname === "/delete_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, (error) => {
        response.writeHead(302, {
          Location: `/`,
        });
        response.end();
      });
    });
  } else {
    response.writeHead(404); // 파일을 찾을 수 없을 때 서버가 돌려주는 번호 404
    response.end("Not found");
  }
});

app.listen(3000); // 80이 웹의 기본값
