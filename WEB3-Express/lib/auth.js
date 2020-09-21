module.exports = {
  IsOwner: function (req, res) {
    if (req.session.isLoggedIn) {
      return true;
    } else {
      return false;
    }
  },
  StatusUI: function (req, res) {
    let authStatusUI = '<a href="/auth/login">login</a>';
    if (this.IsOwner(req, res)) {
      authStatusUI = `${req.session.nickname} | <a href="/auth/logout">logout</a>`;
    }
    return authStatusUI;
  },
};
