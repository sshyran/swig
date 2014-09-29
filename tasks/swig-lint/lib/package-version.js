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

module.exports = function (gulp, swig, paths) {

  var through = require('through2');

  function plugin () {

    var regex = /\$\$PACKAGE_VERSION\$\$/,
      success = true,
      content;

    return through.obj(function (file, enc, cb) {

      if (file.isBuffer()) {
        content = file.contents.toString();
        if (content.indexOf('createModule') > -1) {
          if (!regex.test(content)) {
            success = false;
            swig.log.warn(null, file.path);
          }
          else {
            swig.log.success(null, file.path);
          }
        }
      }

      cb();
    }, function (cb) {
      if (!success) {
        swig.log();
        swig.log.warn('Please make sure you\'re retuning an object containing ' + '"version: \'$$PACKAGE_VERSION$$\'"'.bold);
      }
      else {
        swig.log.success(null, 'Complete\n');
      }
      cb();
    });
  }

  gulp.task('lint-package-version', function () {

    swig.log.task('Linting Package Version');

    return gulp.src(paths.js)
      .pipe(plugin());
  });

};
