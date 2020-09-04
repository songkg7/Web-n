var http = require("http");
var fs = require("fs");
var url = require("url");

function templateHTML(title, list, body) {
  return `<!DOCTYPE html>
          <html>
          <head>
              <title>WEB1 - ${title}</title>
              <meta charset="utf-8" />
          </head>
          <body>
              <h1><a href="/">WEB</a></h1>
              ${list}
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
          `<h2>${title}</h2>${description}`
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
            `<h2>${title}</h2>${description}`
          );

          response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
          response.end(template);
        });
      });
    }
  } else {
    response.writeHead(404); // 파일을 찾을 수 없을 때 서버가 돌려주는 번호 404
    response.end("Not found");
  }
});

app.listen(3000); // 80이 웹의 기본값
