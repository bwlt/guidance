module.exports = {
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
  },

  testHelpers: function(req, res) {
    res.json({
      helpersValue: {
        editGeocoderPath: res.locals.editGeocoderPath(),
        geocoderPath: res.locals.geocoderPath(),
        newGeocoderPath: res.locals.newGeocoderPath()
      }
    });
  }
};
