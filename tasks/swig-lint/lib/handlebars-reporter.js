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

module.exports = function (swig) {

  var _ = require('underscore'),
    through = require('through2'),
    gutil = require('gulp-util'),
    res;

  res = through.obj(function (file, enc, cb) {

    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('swig-lint:handlebars-reporter', 'Streaming not supported'));
      return;
    }

    swig.log.success(null, file.path.replace('.js', '.handlebars'));

    cb(null, file);

  });

  res.fail = function handlebarsFailure (e) {

    // Parse error on line 13:
    // ...></section>{{/if}}
    // ---------------------^
    // Expecting 'INVERSE', 'OPEN_ENDBLOCK', got 'EOF'

    var message = e.message,
      file = e.fileName.underline,
      lines = message.split('\n'),
      error = lines[0],
      badCode = lines[1],
      position = lines[2],
      expected = lines[3] || 'Something went awry.',
      pad = swig.log.padding + swig.log.padding + ' ',
      matches = error.match(/(line (\d)+)\:/),
      lineNumber = matches[1] || 'line ???';

    swig.log();
    swig.log.error(null, file);

    swig.log(swig.log.padding + ' ' + expected.cyan);
    swig.log(pad + lineNumber.grey + ' ' + badCode.blue);
    swig.log(pad + (lineNumber + ' ').replace(/\w/g, ' ') + position);

    swig.log();
    swig.log.error('lint-handlebars', 'Please correct the error(s) shown before proceeding.');
  };

  return res;
};