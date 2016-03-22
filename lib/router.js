'use strict';

module.exports = Router;

const _ = require('lodash');
// const deprecate = require('depd')('guidance:router:parser');
const methods = require('methods');
const pluralize = require('pluralize');


function Router(controllers) {
  this._controllers = controllers;
  this.layers = [];
}


Router.prototype._getHandlerFromTarget = function getHandlerFromTarger(target) {
  if (!this._controllers[target.controller]) {
    throw new Error(`controller '${target.controller}' does not exists`);
  }
  else if (!this._controllers[target.controller][target.action]) {
    throw new Error(`action '${target.action}' on controller '${target.controller}' does not exists`);
  }

  return this._controllers[target.controller][target.action];
};


Router.prototype._parseRoute = function(route) {
  let layer = {};
  let target = this._parseControllerActionNotation(route.opts.to);

  layer.method = route.method;
  layer.path = route.path;
  layer.target = target;
  layer.handler = this._getHandlerFromTarget(target);
  if (route._helper) {
    layer.helper = route._helper;
  }

  return layer;
};


Router.prototype._parseControllerActionNotation = function parseControllerActionNotation(notation) {
  const splitted = notation.split('#', 2);

  function removeSuffix(string, suffix) {
    if (string.toLowerCase().endsWith(suffix)) {
      const index = string.toLowerCase().lastIndexOf(suffix);
      return string.slice(0, index);
    }
    else {
      return string;
    }
  }

  return {
    controller: removeSuffix(splitted[0], 'controller'),
    action: removeSuffix(splitted[1], 'action')
  };
};


Router.prototype._getControllerFromNotation = function getControllerFromNotation(notation, controllers) {
  const parsed = this._parseControllerActionNotation(notation);

  return controllers[parsed.controller][parsed.action];
};


Router.prototype.resources = function(resource) {
  let singular = pluralize(resource, 1);
  let Singular = _.capitalize(singular);

  let routes = [
    // index
    { method: 'get',
      path: `/${resource}`,
      opts: {
        to: `${resource}#index` },
      _helper: { [`${resource}Path`]: () => `/${resource}` } },
    // new
    { method: 'get',
      path: `/${resource}/new`,
      opts: {
        to: `${resource}#new` },
      _helper: { [`new${Singular}Path`]: () => `/${resource}/new` } },
    // create
    { method: 'post',
      path: `/${resource}`,
      opts: {
        to: `${resource}#create` } },
    // show
    { method: 'get',
      path: `/${resource}/:id`,
      opts: {
        to: `${resource}#show` },
      _helper: { [`${singular}Path`]: (id) => `/${resource}/${id}` } },
    // edit
    { method: 'get',
      path: `/${resource}/:id/edit`,
      opts: {
        to: `${resource}#edit` },
      _helper: { [`edit${Singular}Path`]: (id) => `/${resource}/${id}/edit` } },
    // update (patch version)
    { method: 'patch',
      path: `/${resource}/:id`,
      opts: {
        to: `${resource}#update` } },
    // update (put version)
    { method: 'put',
      path: `/${resource}/:id`,
      opts: {
        to: `${resource}#update` } },
    // delete
    { method: 'delete',
      path: `/${resource}/:id`,
      opts: {
        to: `${resource}#delete` } }
  ];

  routes.forEach(route => this.layers.push(this._parseRoute(route)));
};


// attach express valid methods to the resolver
methods.forEach((method) => {
  Router.prototype[method] = function(path, opts) {
    let layer = this._parseRoute({ method, path, opts });

    this.layers.push(layer);
  };
});
