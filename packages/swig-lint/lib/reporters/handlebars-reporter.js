

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
  let fileCount = 0;
  let errors = false;

  const res = through.obj((file, enc, cb) => {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('swig-lint:handlebars-reporter', 'Streaming not supported'));
      return;
    }

    fileCount++;

    // listing all of the files that were successful is awefully verbose
    if (swig.argv.verbose || swig.argv.poolparty) {
      swig.log.success(null, file.path.replace('.js', '.handlebars'));
    }

    cb(null, file);
  },
  (cb) => {
    if (!errors) {
      if (fileCount) {
        swig.log.info('', `${fileCount} files lint-free.\n`);
      } else {
        swig.log.info('', 'No files to lint.\n');
      }
    }
    cb();
  });

  res.fail = function handlebarsFailure(e) {
    // As of Handlebars 4.x, it is throwing two different kinds of errors.
    // A parse error:
    //
    //   Parse error on line 13:
    //   ...></section>{{/if}}
    //   ---------------------^
    //   Expecting 'INVERSE', 'OPEN_ENDBLOCK', got 'EOF'
    //
    // and a regular error:
    //
    //   {
    //     "lineNumber": 3,
    //     "message": "if doesn't match title - 3:3",
    //     "name": "Error",
    //     "column": 3
    //   }
    //
    // we need to check for both.
    // open issue asking for unification: https://github.com/wycats/handlebars.js/issues/1173

    errors = true;

    let message = e.message;
    const file = e.fileName.replace(process.cwd(), '').underline;
    const lines = message.split('\n');
    const pad = `${swig.log.padding + swig.log.padding} `;
    let error;
    let badCode;
    let position;
    let expected;
    let matches;
    let lineNumber;
    let linePad;

    swig.log();
    swig.log.error(null, file);

    // we're dealing with a parse error
    if (/Parse error on line/.test(message)) {
      error = lines[0];
      badCode = lines[1];
      position = lines[2];
      expected = lines[3] || 'Something went awry.';
      matches = error.match(/(line (\d)+):/);
      lineNumber = matches[1] || 'line ???';
      linePad = (new Array(lineNumber.length + 1)).fill(' ').join('');

      swig.log(`${pad + lineNumber.grey} ${badCode.blue}`);
      swig.log(pad + linePad + position);
      swig.log(pad + linePad + expected.cyan);
    } else {
      // we're dealing with some other error
      message = message.replace(/ - \d+:\d+/, '');
      swig.log(`${pad + (`line ${e.lineNumber}  col ${e.column}`).grey}  ${message.blue}`);
    }

    swig.log();
    swig.log.error('lint-handlebars', 'Please correct the error(s) shown before proceeding.');
  };

  return res;
};
