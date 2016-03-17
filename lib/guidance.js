module.exports = Guidance;

const path = require('path');
const requireDir = require('require-dir');

const helpers = require('./helpers');
const Resolver = require('./resolver');


const defaultOptions = {
  controllersDir: path.join(process.cwd(), 'controllers')
};


function Guidance() {
  this.options = {};
  this.app = null;
}


Guidance.prototype.initialize = function(routes, opts) {
  this.options = helpers.applyDefaults(opts, defaultOptions);

  // returns the middleware
  return (req, res, next) => {
    this.app = req.app;
    this.applyRoutes(routes);
    next();
  };
};


Guidance.prototype.applyRoutes = function(routes) {
  const controllers = requireDir(this.options.controllersDir);
  routes(new Resolver(this.app, controllers));
};
