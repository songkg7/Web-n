var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");

function templateHTML(title, list, body, control) {
  return `<!DOCTYPE html>
          <html>
          <head>
              <title>WEB1 - ${title}</title>
              <meta charset="utf-8" />
          </head>
          <body>
              <h1><a href="/">WEB</a></h1>
              ${list}
              ${control}
              ${body}
          </body>
          </html>`;
}

function templateList(filelist) {
  var list = "<ul>";
  var i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i++;
  }
  list = list + "</ul>";
  return list;
}

var app = http.createServer((request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", (error, filelist) => {
        var title = "Welcome";
        var description = "Hello, Node.js";
        var list = templateList(filelist);
        var template = templateHTML(
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );

        response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
        response.end(template);
      });
    } else {
      fs.readdir("./data", (error, filelist) => {
        fs.readFile(`data/${queryData.id}`, "utf8", (err, description) => {
          var title = queryData.id;
          var list = templateList(filelist);
          var template = templateHTML(
            title,
            list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );

          response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
          response.end(template);
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", (error, filelist) => {
      var title = "WEB - create";
      var list = templateList(filelist);
      var template = templateHTML(
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
      response.end(template);
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
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end(template);
      });
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", (error, filelist) => {
      fs.readFile(`data/${queryData.id}`, "utf8", (err, description) => {
        var title = queryData.id;
        var list = templateList(filelist);
        var template = templateHTML(
          title,
          list,
          `
          <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p>
            <input type="text" name="title" placeholder="title" value="${title}"/>
          </p>
          <p>
            <textarea name="description" placeholder ="description" id="" cols="30" rows="10">${description}</textarea>
          </p>
          <p>
            <input type="submit" />
          </p>
        </form>
        `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );

        response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
        response.end(template);
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
          response.writeHead(302, { Location: `/?id=${title}` });
          response.end();
        });
      });
      console.log(post);
    });
  } else {
    response.writeHead(404); // 파일을 찾을 수 없을 때 서버가 돌려주는 번호 404
    response.end("Not found");
  }
});

app.listen(3000); // 80이 웹의 기본값
