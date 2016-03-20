'use strict';

module.exports = Guidance;

const debug = require('debug')('guidance:guidance');
const path = require('path');
const requireDir = require('require-dir');

const helpers = require('./helpers');
const Parser = require('./routeParser');


let controllers;
let defaultOptions = {
  controllersDir: path.join(process.cwd(), 'controllers')
};


function Guidance() {
  this.app = null;
  this.routesSchema = {};
}


Guidance.prototype.initialize = function(routes, opts) {
  debug('initializing Guidance');

  let options = helpers.applyDefaults(opts, defaultOptions);
  controllers = requireDir(options.controllersDir);
  this.routesSchema = this.parseRoutes(routes);

  // returns the middleware
  return (req, res, next) => {
    debug('executing Guidance middleware');
    this.app = req.app;
    this.applyRoutes();
    next();
  };
};


Guidance.prototype.applyRoutes = function() {
  Object.keys(this.routesSchema).forEach((controllerName) => {
    const actionsDefinitions = this.routesSchema[controllerName];

    actionsDefinitions.forEach((definition) => {
      this.app[definition.method](definition.path, controllers[controllerName][definition.name]);
    });
  });
};


Guidance.prototype.parseRoutes = function(routes) {
  const parser = new Parser;

  routes(parser); // this statement fills the parser.schema attribute

  Object.keys(parser.schema).forEach((controllerName) => {
    const actionsDefinitions = parser.schema[controllerName];
    const controller = controllers[controllerName];

    if (!controller) {
      throw new Error('controller \'' + controllerName + '\' does not exists');
    }

    actionsDefinitions.forEach((action) => {
      if (!controller[action.name]) {
          throw new Error('action \'' + action.name + '\' on controller \'' + controllerName + '\' does not exists');
      }
    });
  });

  return parser.schema;
};
