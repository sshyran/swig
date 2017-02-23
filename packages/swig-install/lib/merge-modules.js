

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
  return function mergeModules() {
    const _ = require('underscore');
    const path = require('path');
    const glob = require('glob');
    const util = require('./merge-util')(gulp, swig);
    const modulesPath = path.join(swig.temp, '/**/node_modules/@gilt-tech');
    const packages = glob.sync(path.join(modulesPath, '/**/package.json'));

    // we need to merge whatever the app defined (uiDeps) as well
    // since there may be conflicts between the app and module deps
    const basePkg = _.extend({}, swig.pkg);
    let deps = util.extract(basePkg, {}, path.basename(swig.cwd));

    swig.log();
    swig.log.task('Merging Node Modules Package(s)');

    _.each(packages, (pkgId) => {
      const pkg = require(pkgId);
      deps = util.extract(pkg, deps, pkg.name);
    });

    swig.log.info(null, 'Extracting dependencies');

    deps = util.iterate(deps);

    if (!deps) {
      swig.log.error('install:merge-modules', 'Validation of module dependencies failed.');
      process.exit(0);
    }
  };
};
