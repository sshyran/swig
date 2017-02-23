module.exports = function renderTemplate(preamble, configs, files) {
  return `
  ${preamble}

  require = require || {};

  var _cb = require.callback;

  require.callback = function () {
    _cb && _cb();
    var configs = ${configs};
    for (var key in configs) {
      if (Object.prototype.hasOwnProperty.call(configs, key)) {
        gilt.define(key, configs[key]);
      }
    }
  };
  ${files}
  `;
};
