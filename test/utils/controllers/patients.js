module.exports = {
  show: function(req, res) {
    res.json({ message: 'show patient ' + req.params.id });
  }
};
