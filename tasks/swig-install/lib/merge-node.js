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

// handles merging module packages for node apps
module.exports = function (gulp, swig, util) {

  return function node () {
    var path = require('path'),
      deps,
      pkg;

    swig.log.task('Merging Node App Package(s)');

    pkg = swig.pkg;

    swig.log.task('Extracting dependencies');

    deps = util.extract(pkg, {}, path.basename(swig.cwd));

    deps = util.iterate(deps);

    if (deps) {
      util.generate(deps);
    }
    else {
      swig.log.error('merge-node', 'Node validation of dependencies failed.');
    }
  };
};