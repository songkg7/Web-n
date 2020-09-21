const express = require("express");
const router = express.Router();
const template = require("../lib/template.js");

module.exports = function (passport) {
  router.get("/login", (req, res) => {
    let fmsg = req.flash();
    let feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    let title = "WEB - login";
    let list = template.list(req.list);
    let html = template.HTML(
      title,
      list,
      `
      <div style='color:red;'>${feedback}</div>
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

  router.post(
    "/login_process",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/auth/login",
      failureFlash: true,
      successFlash: true,
    })
  );

  router.get("/logout", (req, res) => {
    req.logout();
    // req.session.destroy(function (err) {
    //   res.redirect("/");
    // });
    req.session.save(function () {
      res.redirect("/");
    });
  });
  return router;
};
