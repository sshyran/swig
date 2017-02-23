

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
  const through = require('through2');

  function plugin() {
    const regex = /\$\$PACKAGE_VERSION\$\$/;
    let success = true;
    let fileCount = 0;
    let skippedCount = 0;
    let content;

    return through.obj((file, enc, cb) => {
      if (file.isBuffer()) {
        content = file.contents.toString();
        if (content.indexOf('createModule') > -1 || content.indexOf('gilt.define') > -1) {
          fileCount++;

          if (!regex.test(content)) {
            success = false;
            swig.log.warn(null, file.path);
          } else {
            // listing all of the files that were successful is awefully verbose
            // eslint-disable-next-line
            if (swig.argv.verbose || swig.argv.poolparty) {
              swig.log.success(null, file.path);
            }
          }
        } else {
          skippedCount++;
        }
      }

      cb();
    }, (cb) => {
      if (!success) {
        swig.log();
        swig.log.warn(`Please make sure you're retuning an object containing ${'"version: \'$$PACKAGE_VERSION$$\'"\n'.bold}`);
      } else {
        if (skippedCount > 0) {
          swig.log.info('', `Skipped ${skippedCount} files.\n`);
        }

        if (fileCount) {
          swig.log.info('', `${fileCount} files lint-free.\n`);
        } else if (skippedCount < fileCount) {
          swig.log.info('', 'No files to lint.\n');
        }
      }
      cb();
    });
  }

  gulp.task('lint-package-version', ['lint-setup'], () => {
    swig.log.task('Linting Package Version variable in scripts');

    return gulp.src([
      swig.linter.paths.js,
      `!${swig.linter.paths.js.replace('/**/', '/spec/**/')}`
    ]).pipe(plugin());
  });
};
