module.exports = Resolver;


const methods = require('methods');

const helpers = require('./helpers');


function Resolver(app, controllers) {
  this.app = app;
  this.controllers = controllers;
}


// attach express valid methods to the resolver
methods.forEach((method) => {
  Resolver.prototype[method] = function(path, opts) {
    const controller = helpers.getControllerFromNotation(opts.to, this.controllers);
    this.app[method](path, controller);
  };
});
