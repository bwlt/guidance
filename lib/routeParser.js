module.exports = RouteParser;

const _ = require('lodash');
const methods = require('methods');

const helpers = require('./helpers');


function RouteParser() {
  this.schema = {};
}


RouteParser.prototype.addRoute = function(method, path, target) {
  if (!this.schema.hasOwnProperty(target.controller)) {
    this.schema[target.controller] = [];
  }

  Object.keys(this.schema).forEach((registeredController) => {
    if (_.find(this.schema[registeredController], { method, path })) {
      // TODO change error
      // TODO change error
      throw new Error('lol');
    }
  });

  this.schema[target.controller].push({ method, path, name: target.action });
};


RouteParser.prototype.resources = function(resource) {
  this.addRoute('get',    `/${resource}`,          { controller: resource, action: 'index' });
  this.addRoute('get',    `/${resource}/new`,      { controller: resource, action: 'new' });
  this.addRoute('post',   `/${resource}`,          { controller: resource, action: 'create' });
  this.addRoute('get',    `/${resource}/:id`,      { controller: resource, action: 'show' });
  this.addRoute('get',    `/${resource}/:id/edit`, { controller: resource, action: 'edit' });
  this.addRoute('patch',  `/${resource}/:id`,      { controller: resource, action: 'update' });
  this.addRoute('put',    `/${resource}/:id`,      { controller: resource, action: 'update' });
  this.addRoute('delete', `/${resource}/:id`,      { controller: resource, action: 'delete' });
};




// attach express valid methods to the resolver
methods.forEach((method) => {
  RouteParser.prototype[method] = function(path, opts) {
    const controller = helpers.parseControllerActionNotation(opts.to);

    this.addRoute(method, path, controller);
  };
});
