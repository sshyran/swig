

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
  const _ = require('underscore');
  const through = require('through2');
  const gutil = require('gulp-util');
  const maxProblems = 10;
  let success = true;
  let fileCount = 0;
  let problems = 0;

  const res = through.obj((file, enc, cb) => {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('swig-lint:reporter', 'Streaming not supported'));
      return;
    }

    fileCount++;

    const recess = file.recess;
    const liner = /^([0-9]+)(\.\s)(.+)$/i;
    let lines;
    let matches;
    let lineNumber;
    let target;
    let desc;

    if (recess && !recess.success) {
      swig.log('');
      swig.log.warn(null, file.path.underline);

      success = false;

      lines = _.reject(recess.results, line => !line.trim());

      _.each(lines, (line) => {
        line = gutil.colors.stripColor(line).trim();

        if (!desc) {
          desc = line;
        } else {
          matches = liner.exec(line);
          lineNumber = parseInt(matches[1], 10);
          target = matches[3];

          swig.log(swig.log.padding + desc.cyan);
          swig.log(`${swig.log.padding + swig.log.padding + (`line ${lineNumber}`).grey} ${target.blue}`);
          desc = null;
          problems++;
        }
      });

      swig.log();
    } else if (swig.argv.verbose || swig.argv.poolparty) {
      // listing all of the files that were successful is awefully verbose
      swig.log.success(null, file.path);
    }

    cb(null, file);
  }, (cb) => {
    if (fileCount === 0 || success) {
      if (fileCount) {
        swig.log(`   ${fileCount} files lint-free\n`);
      } else {
        swig.log('    No files to lint.\n');
      }
    } else if (fileCount > maxProblems || problems > maxProblems) {
      swig.log.error('lint-less', `You've got ${problems.toString().magenta} warnings. Please do some cleanup before proceeding.`);
      process.exit(0);
    } else {
      swig.log('');
    }

    cb();
  });

  res.fail = function recessFailure(e) {
    const recess = e.recess;

    swig.log();
    swig.log.error(null, e.fileName);

    swig.log(`${swig.log.padding + swig.log.padding + (` line ${recess.line} col ${recess.col}`).grey} ${recess.message.blue}`);

    swig.log();
    swig.log.error('lint-css', 'Please correct the error(s) shown before proceeding.');
    process.exit(0);
  };

  return res;
};
