'use strict';

module.exports = Router;

const _ = require('lodash');
const debug = require('debug')('guidance:router');
// const deprecate = require('depd')('guidance:router:parser');
const methods = require('methods');
const pluralize = require('pluralize');


function Router(controllers) {
  this._controllers = controllers;
  this.layers = [];
  this.namespaceStack = [];
  this.scopeStack = [];
  this.nestedStack = [];
}


Router.prototype._getHandlerFromTarget = function getHandlerFromTarget(target) {
  let controllers = this._controllers;

  if (!_.isEmpty(this.namespaceStack)) {
    controllers = _.get(controllers, this.namespaceStack.join('.'));
  }
  if (!_.isEmpty(this.scopeStack)) {
    controllers = _.get(controllers, this.scopeStack.join('.'));
  }

  if (!controllers[target.controller]) {
    throw new Error(`controller '${target.controller}' does not exists`);
  }
  else if (!controllers[target.controller][target.action]) {
    throw new Error(`action '${target.action}' on controller '${target.controller}' does not exists`);
  }

  return controllers[target.controller][target.action];
};


Router.prototype._getHelperFromNamedRoute = function _getHelperFromNamedRoute(routeName, path) {
  return { [`${routeName}Path`]: () => path };
};


Router.prototype._contextualizePath = function _contextualizePath(path) {
  if (!_.isEmpty(this.namespaceStack)) {
    return this._namespacePath(path);
  }
  else if (!_.isEmpty(this.nestedStack)) {
    return this._nestPath(path);
  }
  else {
    return path;
  }
};


Router.prototype._namespacePath = function _namespacePath(path) {
  let namespaced = require('path').join('/', this.namespaceStack.join('/'), path);
  debug(`namespaced '${path}' to '${namespaced}'`);

  return namespaced;
};


Router.prototype._nestPath = function _nestPath(path) {
  let last = _.last(this.nestedStack);
  let nested = require('path').join(
    '/',
    pluralize.plural(last),
    `:${last}Id`,
    path
  );

  debug(`nested '${path}' to '${nested}'`);

  return nested;
};


Router.prototype._parseRoute = function _parseRoute(route) {
  let layer = {};
  let target = this._parseControllerActionNotation(route.opts.to);

  layer.method = route.method;
  layer.path = this._contextualizePath(route.path);
  layer.target = target;
  layer.handler = this._getHandlerFromTarget(target);
  if (route._helper) {
    layer.helper = route._helper;
  }
  else if (route.opts.as) {
    layer.helper = this._getHelperFromNamedRoute(route.opts.as, layer.path);
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


Router.prototype.root = function root(opts) {
  this.layers.push(this._parseRoute({method: 'get', path: '/', opts }));

  return this;
};


Router.prototype.resources = function(resource, fn) {
  if (_.isArray(resource)) {
    resource.forEach((resource) => {
      this.resources.call(this, resource);
    });

    return;
  }
  else if (_.isFunction(fn)) {
    let singular = pluralize(resource, 1);
    this._nested(singular, fn);

    return;
  }

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


Router.prototype.resource = function(resource) {
  if (_.isArray(resource)) {
    resource.forEach((resource) => {
      this.resource.call(this, resource);
    });

    return;
  }

  let Resource = _.capitalize(resource);

  let routes = [
    // new
    { method: 'get',
      path: `/${resource}/new`,
      opts: {
        to: `${resource}#new` },
      _helper: { [`new${Resource}Path`]: () => `/${resource}/new` } },
    // create
    { method: 'post',
      path: `/${resource}`,
      opts: {
        to: `${resource}#create` } },
    // show
    { method: 'get',
      path: `/${resource}`,
      opts: {
        to: `${resource}#show` },
      _helper: { [`${resource}Path`]: () => `/${resource}` } },
    // edit
    { method: 'get',
      path: `/${resource}/edit`,
      opts: {
        to: `${resource}#edit` },
      _helper: { [`edit${Resource}Path`]: () => `/${resource}/edit` } },
    // update (patch version)
    { method: 'patch',
      path: `/${resource}`,
      opts: {
        to: `${resource}#update` } },
    // update (put version)
    { method: 'put',
      path: `/${resource}`,
      opts: {
        to: `${resource}#update` } },
    // delete
    { method: 'delete',
      path: `/${resource}`,
      opts: {
        to: `${resource}#delete` } }
  ];

  routes.forEach(route => this.layers.push(this._parseRoute(route)));
};


Router.prototype.namespace = function (namespace, fn) {
  this.namespaceStack.push(namespace);
  fn.call(this);
  this.namespaceStack.pop();
};


Router.prototype.scope = function (scope, fn) {
  this.scopeStack.push(scope);
  fn.call(this);
  this.scopeStack.pop();
};


Router.prototype._nested = function(resource, fn) {
  this.nestedStack.push(resource);
  fn.call(this);
  this.nestedStack.pop();
};


// attach express valid methods to the resolver
methods.forEach((method) => {
  Router.prototype[method] = function(path, opts) {
    let layer = this._parseRoute({ method, path, opts });

    this.layers.push(layer);
  };
});
