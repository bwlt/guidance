module.exports = {
  index: function(req, res) {
    res.json({ message: 'index action' });
  },
  about: function(req, res) {
    res.json({ message: 'about action' });
  },
  homepage: function(req, res) {
    res.json({
      helpers: {
        homepagePath: res.locals.homepagePath()
      }
    });
  }
};
