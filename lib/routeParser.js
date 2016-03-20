module.exports = RouteParser;

const _ = require('lodash');
const methods = require('methods');

const helpers = require('./helpers');


function RouteParser() {
  this.schema = {};
}


RouteParser.prototype.addRoute = function(method, path, controller) {
  if (!this.schema.hasOwnProperty(controller.name)) {
    this.schema[controller.name] = [];
  }

  Object.keys(this.schema).forEach((registeredController) => {
    if (_.find(this.schema[registeredController], { method, path })) {
      // TODO change error
      throw new Error('lol');
    }
  });

  this.schema[controller.name].push({ method, path, name: controller.action });
};




// attach express valid methods to the resolver
methods.forEach((method) => {
  RouteParser.prototype[method] = function(path, opts) {
    const controller = helpers.parseControllerActionNotation(opts.to);

    this.addRoute(method, path, controller);
  };
});
