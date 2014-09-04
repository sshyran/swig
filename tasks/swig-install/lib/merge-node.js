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
    var deps,
      pkg;

    swig.log('Merging Node App Package(s):');

    pkg = swig.pkg;

    swig.log('Extracting dependencies');

    deps = util.extract(pkg, {}, path.basename(cwd));
    deps = util.iterate(deps);

    if (deps) {
      until.generate(deps);
    }
    else {
      swig.log('Node validation of dependencies failed.');
    }
  };
};