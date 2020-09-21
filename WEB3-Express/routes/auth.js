const express = require("express");
const router = express.Router();
const template = require("../lib/template.js");

const authData = {
  email: "song_kg@naver.com",
  password: "1111111",
  nickname: "song_kg",
};

router.get("/login", (req, res) => {
  let title = "WEB - login";
  let list = template.list(req.list);
  let html = template.HTML(
    title,
    list,
    `
    <form action="/auth/login_process" method="post">
      <p><input type="text" name="email" placeholder="email"></p>
      <p><input type="password" name="pwd" placeholder="password"></p>
      <p>
        <input type="submit" value = "login">
      </p>
    </form>
    `,
    ""
  );
  res.send(html);
});

router.post("/login_process", (req, res) => {
  let post = req.body;
  let email = post.email;
  let password = post.pwd;
  if (email === authData.email && password === authData.password) {
    req.session.isLoggedIn = true;
    req.session.nickname = authData.nickname;
    // .save 를 통해서 세션을 저장하는 과정이 끝난 후 redirect 를 실행한다
    req.session.save(function () {
      res.redirect("/");
    });
  } else {
    res.send("Who?");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

module.exports = router;
