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

module.exports = function (gulp, swig) {

  var _ = require('underscore'),
    through = require('through2');

  function plugin () {

    var regex = /[^\u0000-\u00ff]/,
      success = true,
      fileSuccess = true,
      fileCount = 0,
      filePath,
      errors = [],
      content,
      matches;

    return through.obj(function (file, enc, cb) {

      if (file.isBuffer()) {
        content = file.contents.toString();
        content = content.split('\n');

        fileCount++;

        _.each(content, function (line, index) {
          fileSuccess = !regex.test(line);

          if (!fileSuccess) {
            success = false;
            matches = line.match(regex);

            errors.push({ line: index + 1, col: line.indexOf(matches[0]) + 1, char: matches[0] });
            filePath = file.path;
          }
        });

        if (fileSuccess) {
          // listing all of the files that were successful is awefully verbose
          if (swig.argv.verbose || swig.argv.poolparty) {
            swig.log.success(null, file.path);
          }
        }
      }

      cb();
    }, function (cb) {
      if (!success) {
        swig.log.warn(null, filePath);

        _.each(errors, function (err) {
          swig.log(
            swig.log.padding + swig.log.padding +
            ('line ' + err.line + ' col ' + err.col).grey +
            ' Found possible unicode character: '.blue +
            '\'' + err.char + '\''
          );
        });
        swig.log();

        swig.log.warn('Please clean up any unicode characters, they can cause problems.\n');
      }
      else {
        if (fileCount){
          swig.log.info('', fileCount + ' files lint-free.\n');
        }
        else {
          swig.log.info('', 'No files to lint.\n');
        }
      }

      cb();
    });
  }

  gulp.task('lint-unicode', ['lint-setup'], function () {

    swig.log.task('Linting Unicode Characters');

    if (swig.pkg.gilt && swig.pkg.gilt.lint && swig.pkg.gilt.lint && swig.pkg.gilt.lint.unicode === false) {
      swig.log.info('', 'Skipping Unicode Linting per package.json!');
      swig.log();
      return;
    }

    return gulp.src(swig.linter.paths.js)
      .pipe(plugin());
  });

};
