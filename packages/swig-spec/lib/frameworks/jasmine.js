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

module.exports = function (gulp, swig, options) {
  const _ = require('underscore');
  const file = require('gulp-file');
  const fs = require('fs');
  const path = require('path');
  const jasmine = require('gulp-jasmine-phantomjs');
  const mustache = require('mustache');

  const jasminePath = path.join(path.dirname(require.resolve('gulp-jasmine-phantomjs')), 'vendor/jasmine-1.3.1');

  const runnerPath = path.join(__dirname, '../../templates/jasmine-runner.mustache');
  let runner = fs.readFileSync(runnerPath, 'utf-8');

  swig.log.info('', 'Rendering Runner...\n');

  options = _.extend(options, {
    jasminePath: jasminePath,
    libPath: __dirname
  });

  runner = mustache.render(runner, options);

  swig.log.task('Running Specs with PhantomJS+Jasmine');
  swig.log('');

  const stream = file('runner.html', runner, { src: true });

  if (!swig.argv.browser) {
    return stream
        .pipe(gulp.dest(options.runnerPath))
        .pipe(jasmine({
          verbose: options.verbose,
          phantomjs: {
            webSecurityEnabled: false,
            localToRemoteUrlAccessEnabled: true,
            ignoreSslErrors: true
          }
        }));
  }

  return stream;
};
