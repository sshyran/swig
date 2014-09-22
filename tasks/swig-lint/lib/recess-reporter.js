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
    gutil = require('gulp-util'),
    success = true,
    filecount = 0;

  return through.obj(function (file, enc, cb) {

    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('swig-lint:reporter', 'Streaming not supported'));
      return;
    }

    filecount++;

    var recess = file.recess,
      liner = /^([0-9]+)(\.\s)(.+)$/i,
      lines,
      matches,
      result = {},
      results = [];

    if (recess && !recess.success) {

      success = false;

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

      console.log('TODO: Make this pretty');
      console.log(results);

    }

    cb(null, file);
  }, function (cb) {
    if (filecount === 0 || success) {
      swig.log.write('  ');
      swig.log.success(null, '  ' + filecount + ' file(s), success.\n');
    }
    cb();
  });
};