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

   Looks for createModule, requireModule or requireSpecs in modules
   and throws if they exist. Those methods are obsolete and gilt.require
   and gilt.define should be used moving forward.
*/

module.exports = function (gulp, swig) {

  var _ = require('underscore'),
    through = require('through2');

  function plugin () {

    var regex = {
        createModule: /createModule/,
        requireModules:/requireModules/,
        requireSpecs: /requireSpecs/
      },
      success = true,
      fileCount = 0,
      content;

    return through.obj(function (file, enc, cb) {

      var fileSuccess = true;

      if (file.isBuffer()) {
        content = file.contents.toString();
        fileCount++;

        _.each(regex, function (r, name) {
          fileSuccess = true;

          if (!r.test(content)) {
            success = fileSuccess = false;
            swig.log.error(null, 'Found \'' + name + '\' in ' + file.path);
          }
        });

        // listing all of the files that were successful is awefully verbose
        if (fileSuccess && swig.argv.verbose || swig.argv.poolparty) {
          swig.log.success(null, file.path);
        }
      }

      cb();
    }, function (cb) {
      if (!success) {
        swig.log();
        swig.log.error('createModule, requireModules, and requireSpecs are now obsolete.');
        swig.log();
        swig.log('Please update the code in the file(s) listed above.');
        swig.log('createModule   → gilt.define');
        swig.log('requireModules → gilt.require');
        swig.log('requireSpecs   → gilt.require');
        process.exit(1);
      }
      else {
        if (fileCount){
          swig.log.info('', fileCount + ' files lint-free.\n');
        }
        else if (fileCount === 0) {
          swig.log.info('', 'No files to lint.\n');
        }
      }
      cb();
    });
  }

  gulp.task('lint-old-require', ['lint-setup'], function () {

    swig.log.task('Linting Old Require in scripts');

    return gulp.src([
        swig.linter.paths.js
      ]).pipe(plugin());
  });

};
