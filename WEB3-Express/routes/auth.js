const express = require("express");
const router = express.Router();
const template = require("../lib/template.js");
const shortid = require("shortid");
const db = require("../lib/db");
const bcrypt = require("bcrypt");

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

  router.get("/register", (req, res) => {
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
      <form action="/auth/register_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p><input type="password" name="pwd2" placeholder="password"></p>
        <p><input type="text" name="displayName" placeholder="display name"></p>
        <p>
          <input type="submit" value = "register">
        </p>
      </form>
      `,
      ""
    );
    res.send(html);
  });

  router.post("/register_process", (req, res) => {
    let post = req.body;
    let email = post.email;
    let pwd = post.pwd;
    let pwd2 = post.pwd2;
    let displayName = post.displayName;

    if (pwd !== pwd2) {
      req.flash("error", "Password must same!");
      res.redirect("/auth/register");
    } else if (
      email === "" ||
      pwd === "" ||
      pwd2 === "" ||
      displayName === ""
    ) {
      req.flash("error", "Please enter all info!");
      res.redirect("/auth/register");
    } else {
      bcrypt.hash(pwd, 10, function (err, hash) {
        let user = {
          id: shortid.generate(),
          email: email,
          password: hash,
          displayName: displayName,
        };
        db.get("users").push(user).write();
        req.login(user, function (err) {
          return res.redirect("/");
        });
      });
    }
  });

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
