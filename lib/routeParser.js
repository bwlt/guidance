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
      // TODO change error
      throw new Error('lol');
    }
  });

  this.schema[controller.name].push({ method, path, name: controller.action });
};


RouteParser.prototype.resources = function(resource) {
  this.addRoute('get',    `/${resource}`,          { name: resource, action: 'index' });
  this.addRoute('get',    `/${resource}/new`,      { name: resource, action: 'new' });
  this.addRoute('post',   `/${resource}`,          { name: resource, action: 'create' });
  this.addRoute('get',    `/${resource}/:id`,      { name: resource, action: 'show' });
  this.addRoute('get',    `/${resource}/:id/edit`, { name: resource, action: 'edit' });
  this.addRoute('patch',  `/${resource}/:id`,      { name: resource, action: 'update' });
  this.addRoute('put',    `/${resource}/:id`,      { name: resource, action: 'update' });
  this.addRoute('delete', `/${resource}/:id`,      { name: resource, action: 'delete' });
};




// attach express valid methods to the resolver
methods.forEach((method) => {
  RouteParser.prototype[method] = function(path, opts) {
    const controller = helpers.parseControllerActionNotation(opts.to);

    this.addRoute(method, path, controller);
  };
});
