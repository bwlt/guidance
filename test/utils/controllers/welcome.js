module.exports = {
  index: function(req, res) {
    res.json({ message: 'index action' });
  },
  homepage: function(req, res) {
    res.json({
      helpers: {
        homepagePath: res.locals.homepagePath()
      }
    });
  }
};
