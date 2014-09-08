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
    through = require('through2'),
    gutil = require('gulp-util');

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('swig-lint:reporter', 'Streaming not supported'));
      return;
    }

    var recess = file.recess,
      liner = /^([0-9]+)(\.\s)(.+)$/i,
      lines,
      matches,
      result = {},
      results = [];

    if (recess && !recess.success) {

      lines = _.reject(recess.results, function (line) { return !line.trim(); });
      _.each(lines, function (line) {
        line = gutil.colors.stripColor(line).trim();

        if (!result.desc) {
          result.desc = line;
        }
        else {
          matches = liner.exec(line);
          result.line = matches[1];
          result.target = matches[3];
          results.push(result);
          result = {};
        }
      });

      cb(new gutil.PluginError('gulp-recess', file.relative + ': ' + recess.status + ' ' + recess.failureCount + ' failures', {
        fileName: file.path,
        showStack: false
      }));

      return;
    }

    cb(null, file);
  });
};