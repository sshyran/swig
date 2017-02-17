module.exports = function () {
  return function handlebarsLint() {
    const through = require('through2');
    const gutil = require('gulp-util');
    const Handlebars = require('handlebars');
    const XRegExp = require('xregexp').XRegExp;
    const stylish = require('jshint-stylish');
    let fileCount = 0;
    const hasErrors = false;
    const messages = [];

    return through.obj((file, enc, cb) => {
      if (file.isNull()) {
        cb(null, file);
        return;
      }

      if (file.isStream()) {
        cb(new gutil.PluginError('jshint-fail-reporter', 'Streaming not supported'));
        return;
      }

      fileCount++;

      const contents = file.contents.toString();
      const regex = XRegExp('Parse error on line (?<line>[0-9]+)+:\n[^\n]*\n[^\n]*\n(?<message>.*)');

      try {
        Handlebars.precompile(contents, {});
      } catch (e) {
        XRegExp.forEach(e.message, regex, match => messages.push({
          file: file.path,
          error: {
            character: 1,
            code: 'E',
            line: match.line - 1,
            reason: match.message
          }
        }));

        stylish.reporter(messages);
        process.exit(1);
      }

      cb(null, file);
    },
    (cb) => {
      if (!hasErrors) {
        console.log('');
        console.log(`  ${fileCount} Handlebars files lint-free\n`);
      }
      cb();
    });
  };
};
