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

    swig.log.task('Merging Node Modules Package(s)');

    _.each(packages, function (pkg) {
      pkg = require(pkg);
      deps = util.extract(pkg, deps, pkg.name);
    });

    swig.log.success(null, 'Done\n');
    swig.log.task('Extracting dependencies');

    deps = util.iterate(deps);

    if (!deps) {
      swig.log.error('install:merge-modules', 'Validation of module dependencies failed.');
      process.exit(0);
    }

    swig.log.success(null, 'Done\n');
  };
};