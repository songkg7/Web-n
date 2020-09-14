const http = require("http");
const fs = require("fs"); // To control file system
const url = require("url");
const qs = require("querystring");
const template = require("./lib/template.js"); // Refactoring으로 분리한 template 모듈 호출
const path = require("path"); // 경로 입력정보에 대한 보안
const sanitizeHtml = require("sanitize-html"); // 출력정보에 대한 보안
const mysql = require("mysql");
const db_config = require("./config/db_config.json"); // json 파일로 분리하여 보안성 확보
const db = mysql.createConnection({
  host: db_config.host,
  user: db_config.user,
  password: db_config.password,
  database: db_config.database,
});

db.connect();

var app = http.createServer((request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      db.query(`SELECT * FROM topic`, function (error, topics) {
        var title = "Welcome";
        var description = "Hello, Node.js";
        var list = template.list(topics);
        var html = template.html(
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
        response.end(html);
      });
    } else {
      db.query(`SELECT * FROM topic`, function (error, topics) {
        if (error) {
          throw error;
        }
        db.query(
          `SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id=?`,
          [queryData.id],
          function (error2, topic) {
            if (error2) {
              throw error2;
            }
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.html(
              title,
              list,
              `<h2>${title}</h2>${description}
              </p>by ${topic[0].name}<p>
              `,
              `<a href="/create">create</a>
              <a href="/update?id=${queryData.id}">update</a>
              <form action = "delete_process" method = "post" onsubmit="">
                <input type="hidden" name="id" value="${queryData.id}">
                <input type="submit" value="delete">
              </form>`
            );
            response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
            response.end(html);
          }
        );
      });
    }
    // 글생성
  } else if (pathname === "/create") {
    db.query(`SELECT * FROM topic`, function (error, topics) {
      db.query(`SELECT * FROM author`, function (error2, authors) {
        var title = "Create";
        var list = template.list(topics);
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
              ${template.authorSelect(authors)}
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
    });
  } else if (pathname === "/create_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);
      console.log(post);
      db.query(
        `INSERT INTO topic (title, description, created, author_id)
         VALUES(?, ?, NOW(), ?)`,
        [post.title, post.description, post.author],
        function (error, result) {
          if (error) {
            throw error;
          }
          response.writeHead(302, {
            Location: `/?id=${result.insertId}`, // result.insertId -> MySQL행의 ID 값을 가져온다
          });
          response.end();
        }
      );
    });
  } else if (pathname === "/update") {
    db.query(`SELECT * FROM topic`, function (error, topics) {
      if (error) {
        throw error;
      }
      db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function (
        error2,
        topic
      ) {
        if (error2) {
          throw error2;
        }
        db.query(`SELECT * FROM author`, function (error2, authors) {
          var list = template.list(topics);
          var html = template.html(
            topic[0].title,
            list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p>
                <input type="text" name="title" placeholder="title" value="${
                  topic[0].title
                }"/>
              </p>
              <p>
                <textarea 
                name="description" placeholder ="description" id="" cols="30" rows="10">${
                  topic[0].description
                }
                </textarea>
              </p>
              <p>
              ${template.authorSelect(authors, topic[0].author_id)}
              </p>
              <p>
                <input type="submit" />
              </p>
            </form>
          `,
            `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
          );

          response.writeHead(200); // 정상적으로 서버 통신이 완료되었을때 받는 값 = 200
          response.end(html);
        });
      });
    });
  } else if (pathname === "/update_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);

      db.query(
        `UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
        [post.title, post.description, post.author, post.id],
        function (error, result) {
          response.writeHead(302, {
            Location: `/?id=${post.id}`,
          });
          response.end();
        }
      );
    });
  } else if (pathname === "/delete_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body);
      db.query(`DELETE FROM topic WHERE id = ?`, [post.id], function (
        error,
        result
      ) {
        if (error) {
          throw error;
        }
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
