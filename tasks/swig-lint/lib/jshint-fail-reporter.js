
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

  return function reporter () {

    var through = require('through2'),
      gutil = require('gulp-util'),
      total = 0,
      hasErrors = false;

    return through.obj(function (file, enc, cb) {
      if (file.isNull()) {
        cb(null, file);
        return;
      }

      if (file.isStream()) {
        cb(new gutil.PluginError('swig-lint:reporter', 'Streaming not supported'));
        return;
      }

      if (file.jshint && !file.jshint.success && !file.jshint.ignored) {
        var results = file.jshint.results;

        total += results.length;

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

      if (hasErrors) {
        cb(new gutil.PluginError('gulp-jshint', {
          message: 'Please take care of those errors before proceeding.',
          showStack: false
        }));
      }
      else if (total > 50) {
        cb(new gutil.PluginError('gulp-jshint', {
          message: 'Well you didnn\'t have any errors, but you\'ve got ' + total + ' warnings. Please do some cleanup.',
          showStack: false
        }));
      }

    });
  };
};
