
'use strict';

/* copied from swig-lint */

module.exports = function (gulp) {

  var maxWarnings = 10;

  return function reporter () {

    var through = require('through2'),
      gutil = require('gulp-util'),
      fileCount = 0,
      errorCount = 0,
      hasErrors = false;

    return through.obj(function (file, enc, cb) {
      if (file.isNull()) {
        cb(null, file);
        return;
      }

      if (file.isStream()) {
        cb(new gutil.PluginError('jshint-fail-reporter', 'Streaming not supported'));
        return;
      }

      if (file.jshint && !file.jshint.ignored) {
        fileCount++;
      }

      if (file.jshint && !file.jshint.success && !file.jshint.ignored) {
        var results = file.jshint.results;

        errorCount += results.length;

        if (!hasErrors) {
          results.forEach(function (e) {
             // E: Error, W: Warning, I: Info
            if (e.error.code && e.error.code[0] === 'E') {
              hasErrors = true;
            }
          });
        }
      }

      cb(null, file);
    },
    function flush (cb) {
      console.log('');

      if (hasErrors) {
        console.log('  Please correct errors in ' + 'red'.red + ' before proceeding.\n');
        process.exit(1);
      }
      else if (errorCount > maxWarnings) {
        console.log('  You\'ve got ' + errorCount.toString().magenta + ' warnings.\n  Please do some cleanup before proceeding.\n');
        process.exit(1);
      }
      else {
        console.log('  ' + fileCount + ' Javascript files lint-free\n');
      }
      cb();
    });
  };
};
