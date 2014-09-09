'use strict';
/*
 ________  ___       __   ___  ________
|\   ____\|\  \     |\  \|\  \|\   ____\
\ \  \___|\ \  \    \ \  \ \  \ \  \___|
 \ \_____  \ \  \  __\ \  \ \  \ \  \  ___
  \|____|\  \ \  \|\__\_\  \ \  \ \  \|\  \
    ____\_\  \ \____________\ \__\ \_______\
   |\_________\|____________|\|__|\|_______|
   \|_________|

   It's delicious.
   Brought to you by the fine folks at Gilt (http://github.com/gilt)
*/

// handles merging module packages
module.exports = function (gulp, swig) {

  return function mergeModules () {
    var _ = require('underscore'),
      path = require('path'),
      glob = require('glob'),
      util = require('./merge-util')(gulp, swig),
      modulesPath = path.join(swig.temp, '/node_modules'),
      packages = glob.sync(path.join(modulesPath, '/**/package.json')),
      deps;

    swig.log('Merging Node Modules Package(s):');

    _.each(packages, function (pkg) {
      pkg = require(pkg);
      deps = util.extract(pkg, deps, pkg.name);
    });

    swig.log('Extracting dependencies');

    deps = util.iterate(deps);

    if (!deps) {
      swig.log('Merge Modules: validation of module dependencies failed.');
    }
  };
};