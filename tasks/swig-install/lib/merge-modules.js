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
    var
      modulesPath = path.join(tempPath, '/node_modules'),
      packages = glob.sync(path.join(modulesPath, '/**/package.json')),
      deps;

    swig.log('Merging Node Modules Package(s):');

    _.each(packages, function (pkg) {
      pkg = require(pkg);
      deps = extract(pkg, deps, pkg.name);
    });

    swig.log('Extracting dependencies');

    deps = iterate(deps);

    if (!deps) {
      swig.log('Merge Modules: validation of module dependencies failed.');
    }
  };
};