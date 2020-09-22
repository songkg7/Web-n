const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const template = require("../lib/template.js");
const auth = require("../lib/auth");

// lowDB
const db = require("../lib/db");
const shortid = require("shortid");

router.get("/create", (req, res) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/");
    return false;
  }
  let title = "WEB - create";
  let list = template.list(req.list);
  let html = template.HTML(
    title,
    list,
    `
          <form action="/topic/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `,
    "",
    auth.StatusUI(req, res)
  );
  res.send(html);
});

router.post("/create_process", (req, res) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/");
    return false;
  }
  let post = req.body;
  let title = post.title;
  let description = post.description;
  let id = shortid.generate();
  db.get("topics")
    .push({
      id: id,
      title: title,
      description: description,
      user_id: req.user.id,
    })
    .write();
  res.redirect(`/topic/${id}`);
});

router.get("/update/:pageId", (req, res) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/");
    return false;
  }
  let topic = db.get("topics").find({ id: req.params.pageId }).value();
  if (topic.user_id !== req.user.id) {
    req.flash("error", "Not yours!");
    return res.redirect("/");
  }

  let title = topic.title;
  let description = topic.description;
  let list = template.list(req.list);
  let html = template.HTML(
    title,
    list,
    `
        <form action="/topic/update_process" method="post">
          <input type="hidden" name="id" value="${topic.id}">
          <p><input type="text" name="title" placeholder="title" value="${topic.id}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
    `<a href="/topic/create">create</a> <a href="/topic/update/${topic.id}">update</a>`,
    auth.StatusUI(req, res)
  );
  res.send(html);
});

router.post("/update_process", (req, res) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/");
    return false;
  }
  let post = req.body; // body는 수정시 작성한 form 부분의 data
  let id = post.id;
  let title = post.title;
  let description = post.description;
  let topic = db.get("topics").find({ id: id }).value();
  if (topic.user_id !== req.user.id) {
    req.flash("error", "Not yours!");
    return res.redirect("/");
  }
  db.get("topics")
    .find({ id: id })
    .assign({
      title: title,
      description: description,
    })
    .write();
  res.redirect(`/topic/${topic.id}`);
});

router.post("/delete_process", (req, res) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/");
    return false;
  }

  let post = req.body;
  let id = post.id;
  let topic = db.get("topics").find({ id: id }).value();
  if (topic.user_id !== req.user.id) {
    req.flash("error", "Not yours!");
    return res.redirect("/");
  }
  db.get("topics").remove({ id: id }).write();
  return res.redirect("/");
});

router.get("/:pageId", (req, res, next) => {
  let topic = db.get("topics").find({ id: req.params.pageId }).value();
  let user = db
    .get("users")
    .find({
      id: topic.user_id,
    })
    .value();
  let sanitizedTitle = sanitizeHtml(topic.title);
  let sanitizedDescription = sanitizeHtml(topic.description, {
    allowedTags: ["h1"],
  });
  let list = template.list(req.list);
  let html = template.HTML(
    sanitizedTitle,
    list,
    `<h2>${sanitizedTitle}</h2>${sanitizedDescription}
    <p>by ${user.displayName}</p>`,
    ` <a href="/topic/create">create</a>
      <a href="/topic/update/${topic.id}">update</a>
      <form action="/topic/delete_process" method="post">
        <input type="hidden" name="id" value="${topic.id}">
        <input type="submit" value="delete">
      </form>`,
    auth.StatusUI(req, res)
  );
  res.send(html);
});

module.exports = router;
