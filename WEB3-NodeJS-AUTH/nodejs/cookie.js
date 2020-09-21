const http = require("http");
const cookie = require("cookie");

http
  .createServer(function (req, res) {
    console.log(req.headers.cookie);
    let cookies = {};
    if (req.headers.cookie !== undefined) {
      cookies = cookie.parse(req.headers.cookie);
    }
    console.log(cookies.yummy_cookie);
    res.writeHead(200, {
      "Set-Cookie": [
        "yummy_cookie=choco",
        "tasty_cookie=strawberry",
        `Permanent=cookies; Max-Age=${60 * 60 * 24 * 30}`,
        "Secure=Secure; Secure", // Https 로만 전송하게 하는 옵션
        "HttpOnly=HttpOnly; HttpOnly", // JS 로는 제어를 못하도록하는 옵션
        "Path=Path; Path=/cookie", // 경로를 설정
        "Domain=Domain; Domain=o2.org", // 어떠한 서브도메인에서도 살아남게 한다
      ],
    });
    res.end("Cookie!");
  })
  .listen(3000);
