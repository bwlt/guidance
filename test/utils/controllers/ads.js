module.exports = {
  index: function(req, res) {
    res.send('index action');
  },
  new: function(req, res) {
    res.send('new action');
  },
  create: function(req, res) {
    res.send('create action');
  },
  show: function(req, res) {
    res.send('show action');
  },
  edit: function(req, res) {
    res.send('edit action');
  },
  update: function(req, res) {
    res.send('update action');
  },
  delete: function(req, res) {
    res.send('delete action');
  }
};
