const helpers = {};


function removeSuffix(string, suffix) {
  if (string.toLowerCase().endsWith(suffix)) {
    const index = string.toLowerCase().lastIndexOf(suffix);
    return string.slice(0, index);
  }
  else {
    return string;
  }
}


helpers.parseControllerActionNotation = function(notation) {
  const splitted = notation.split('#', 2);

  return {
    name: removeSuffix(splitted[0], 'controller'),
    action: removeSuffix(splitted[1], 'action')
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
