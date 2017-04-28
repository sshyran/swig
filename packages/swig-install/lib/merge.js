

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

// handles merging module packages for apps
module.exports = function (gulp, swig, util) {
  return function node() {
    const _ = require('underscore');
    const path = require('path');
    let uiDeps;

    swig.log();
    swig.log.task('Merging App Package(s)');
    swig.log.info(null, 'Extracting dependencies');

    const pkg = _.extend({}, swig.pkg);

    // we don't want dependencies mixed with uiDeps in node apps
    if (swig.project.type !== 'module' && pkg.dependencies) {
      delete pkg.dependencies;
    }

    uiDeps = util.extract(pkg, {}, path.basename(swig.cwd));
    uiDeps = util.iterate(uiDeps);

    if (uiDeps) {
      util.generate(uiDeps);
    } else {
      swig.log.error('merge-node', 'Validation of dependencies failed.');
      process.exit(0);
    }
  };
};
