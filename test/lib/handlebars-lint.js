
'use strict';

module.exports = function (gulp) {

  return function handlebarsLint () {

    var through = require('through2'),
      gutil = require('gulp-util'),
      Handlebars = require('handlebars'),
      XRegExp = require('xregexp').XRegExp,
      stylish = require('jshint-stylish'),
      fileCount = 0,
      hasErrors = false,
      messages = [];

    return through.obj(function (file, enc, cb) {
      if (file.isNull()) {
        cb(null, file);
        return;
      }

      if (file.isStream()) {
        cb(new gutil.PluginError('jshint-fail-reporter', 'Streaming not supported'));
        return;
      }

      fileCount++;

      var contents = file.contents.toString(),
        regex = XRegExp('Parse error on line (?<line>[0-9]+)+:\n' + '[^\n]*\n' + '[^\n]*\n' + '(?<message>.*)');

      try {
        Handlebars.precompile(contents, {});
      }
      catch (e) {

        XRegExp.forEach(e.message, regex, function(match) {
          return messages.push({
            file: file.path,
            error: {
              character: 1,
              code: 'E',
              line: match.line - 1,
              reason: match.message
            }
          });
        });

        stylish.reporter(messages);
        process.exit(1);
      }

      cb(null, file);
    },
    function flush (cb) {
      if (!hasErrors) {
        console.log('');
        console.log('  ' + fileCount + ' Handlebars files lint-free\n');
      }
      cb();
    });
  };
};
