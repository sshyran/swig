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

  var _ = require('underscore'),
    through = require('through2');

  function plugin () {

    var regex = /[^\u0000-\u00ff]/,
      success = true,
      fileSuccess = true,
      content,
      matches;

    return through.obj(function (file, enc, cb) {

      if (file.isBuffer()) {
        content = file.contents.toString();
        content = content.split('\n');

        _.each(content, function (line, index) {
          fileSuccess = !regex.test(line);

          if (!fileSuccess) {
            success = false;
            matches = line.match(regex);

            swig.log.warn(null, file.path);
            swig.log(swig.log.padding + swig.log.padding +
              ('line ' + (index + 1).toString() + ' col ' + (line.indexOf(matches[0]) + 1)).grey +
              ' Found possible unicode character.'.blue
            );
            swig.log();
          }
        });

        if (fileSuccess) {
          swig.log.success(null, file.path);
        }
      }

      cb();
    }, function (cb) {
      if (!success) {
        swig.log();
        swig.log.warn('Please clean up any unicode characters, they can cause problems.');
      }
      cb();
    });
  }

  gulp.task('lint-unicode', function () {

    swig.log.task('Linting Unicode Characters');

    return gulp.src(paths.js)
      .pipe(plugin());
  });

};
