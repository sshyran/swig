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

  // c) Given the list of all extracted package.json's and the file picked above:
  // i) Extract the uiDependencies or dependencies hash from each file
  // ii) Merge with that, the lazyDependencies hash from the same file
  // NOTE) we build up an intermediate data structure, for error reporting purposes.
  // d) Iterate over each set of dependencies, merging them together intelligently, and look for
  // conflicts
  // i) Example of "intelligently" merging: given 2 versions of foo.bar, 1.2.3 and 1.2.x, merge
  // that as 1.2.3, since 1.2.x is a mask that 1.2.3 satisfies.
  // e) Generate a merged package.json file in a temp folder

// handles merging module packages
module.exports = function (gulp, swig) {
  return function packageMerge() {
    const _ = require('underscore');
    const fs = require('fs');
    const path = require('path');
    const glob = require('glob');
    const gutil = require('gulp-util');
    const util = require('./merge-util')(gulp, swig);
    const merge = require('./merge')(gulp, swig, util);

    // figure out which type we're dealing with
    if (fs.existsSync(path.join(swig.cwd, 'app.js')) || fs.existsSync(path.join(swig.cwd, 'build.sbt'))) { // node or scala apps
      merge();
    } else if (swig.argv.module) {
      swig.log.task('Merging UI-* Module Package Dependencies');

      // enforce that this is a copy of swig.pkg.dependencies, and not a
      // reference. prevents other tasks from using a tainted object.
      const deps = _.extend({}, swig.pkg.dependencies || {});

      util.generate(deps);
    } else {
      throw new gutil.PluginError('package-merge',
      "Couldn't determine what type of thing we're working on.\n" +
      "If it's a Node app, it should have an 'app.js' file in the root.\n" +
      "If it's a Play/Scala app, it should have JARs in /lib.\n" +
      'Swig only supports Node and JVM apps, and ui-* module repos.');
    }
  };
};
