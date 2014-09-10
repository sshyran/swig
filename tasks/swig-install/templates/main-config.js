(function initConfigs () {
  var configs = {{configs}};
  for (var key in configs) {
    if (Object.prototype.hasOwnProperty.call(configs, key) && !requireModules.isLoaded(key)) {
      createConfig(key, configs[key]);
    }
  }
}());