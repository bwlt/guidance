'use strict';

module.exports = Guidance;

const _ = require('lodash');
const debug = require('debug')('guidance:guidance');
// const deprecate = require('depd')('guidance:guidance');
const path = require('path');
const requireDir = require('require-dir');

const Router = require('./router');


let controllers;
let defaultOptions = {
  controllersDir: path.join(process.cwd(), 'controllers')
};


function Guidance() {
  this.app = null;
}


Guidance.prototype.initialize = function(routes, opts) {
  debug('initializing Guidance');

  let options = _.defaults(opts, defaultOptions);
  controllers = requireDir(options.controllersDir);
  let layers = this.parseRoutes(routes);

  // returns the middleware
  return (req, res, next) => {
    debug('executing Guidance middleware');
    this.app = req.app;
    this.applyLayers(layers);
    next();
  };
};


Guidance.prototype.applyLayers = function applyLayers(layers) {
  layers.forEach(layer => {
    this.app[layer.method](layer.path, layer.handler);
  });
};



Guidance.prototype.parseRoutes = function(routes) {
  const router = new Router(controllers);

  routes(router); // this statement fills the router.schema attribute

  return router.layers;
};
