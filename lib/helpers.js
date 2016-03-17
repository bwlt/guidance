const helpers = {};


helpers.parseControllerActionNotation = function(notation) {
  const splitted = notation.split('#', 2);

  return {
    name: splitted[0],
    action: splitted[1]
  };
};


helpers.applyDefaults = function(options, defaults) {
  return Object.assign(
    {},
    defaults,
    options
  );
};


helpers.getControllerFromNotation = function(notation, controllers) {
  const parsed = helpers.parseControllerActionNotation(notation);

  return controllers[parsed.name][parsed.action];
};


module.exports = helpers;
