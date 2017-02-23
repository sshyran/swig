

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

module.exports = function (swig) {
  const through = require('through2');
  const gutil = require('gulp-util');
  const stylish = require('jshint-stylish');
  const maxProblems = 10;
  let success = true;
  let fatal = false;
  let fileCount = 0;
  let problems = 0;
  let errors = 0;

  function toJshint(file) {
    return file.lesshint.errors.map((error) => {
      problems++;

      if (error.severity === 'error') {
        fatal = true;
        errors++;
      }

      return {
        file: file.base + error.file,
        error: {
          character: error.column,
          code: `${error.severity.substring(0, 1).toUpperCase()} ${error.linter}`,
          line: error.line, // - (file.mockLength ? file.mockLength : 0),
          reason: error.message
        }
      };
    });
  }

  const res = through.obj((file, enc, cb) => {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('swig-lint:lesshint-reporter', 'Streaming not supported'));
      return;
    }

    fileCount++;

    if (file.lesshint && !file.lesshint.success) {
      stylish.reporter(toJshint(file));

      success = false;
    } else if (swig.argv.verbose || swig.argv.poolparty) {
      // listing all of the files that were successful is awefully verbose
      swig.log.success(null, file.path);
    }

    cb(null, file);
  }, (cb) => {
    let output;

    if (fileCount === 0 || success) {
      if (fileCount) {
        swig.log.info('', `${fileCount} files lint-free.\n`);
      } else {
        swig.log.info('', 'No files to lint.\n');
      }
    } else if (problems > maxProblems) {
      output = `You've got ${problems.toString().magenta}${problems > 1 ? ' warnings' : ' warning'}`;

      if (errors > 0) {
        output += ` and ${errors.toString().magenta}${errors > 1 ? ' errors' : ' error'}`;
      }

      swig.log.error('lint-css', `${output}. Please do some cleanup before proceeding.`);
      process.exit(1);
    } else if (fatal) {
      output = `You've got ${errors.toString().magenta}${errors > 1 ? ' errors' : ' error'}`;

      swig.log();
      swig.log.error('lint-css', `${output}. Please do some cleanup before proceeding.`);
      process.exit(2);
    } else {
      swig.log('');
    }

    cb();
  });

  return res;
};
