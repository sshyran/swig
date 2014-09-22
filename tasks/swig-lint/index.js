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
    path = require('path'),

    jshint = require('gulp-jshint'),
    recess = require('gulp-recess'),
    handlebars = require('gulp-handlebars'),
    addsrc = require('gulp-add-src'),
    buffer = require('gulp-buffer'),
    gutil = require('gulp-util'),

    mock = require('./lib/mock')(gulp, swig),
    packageVersion = require('./lib/package-version')(gulp, swig),
    recessReporter = require('./lib/recess-reporter')(swig),
    jsFailReporter = require('./lib/jshint-fail-reporter')(gulp, swig),
    handlebarsReporter = require('./lib/handlebars-reporter')(swig),

    baseName,
    baseSource,
    paths;

  function source(type, extension) {
    return baseSource
            .replace(/\{type\}/g, type)
            .replace(/\{extension\}/g, extension);
  }

  if (!swig.pkg) {
    return;
  }

  gulp.task('lint-setup', function (cb) {

    if (paths) {
      cb();
      return;
    }

    swig.log.task('Preparing to Lint');

    // setup our glob paths
    if (swig.project.type === 'webapp') {
      baseName = path.basename(swig.target.path);
      baseSource = path.join(swig.target.path, 'public/{type}/', baseName, '/src/**/*.{extension}');
    }
    else {
      baseSource = path.join(swig.target.path, '/**/*.{extension}');
    }

    paths = {
      js: source('js', 'js'),
      css: source('css', '{css,less}'),
      templates: source('templates', 'handlebars')
    };

    swig.log.success('Complete\n');

    cb();
  });

  gulp.task('lint-script', ['lint-setup'], function () {
    var jshintrc = path.join(__dirname, '.jshintrc');

    swig.log.task('Linting Javascript');

    return gulp.src(paths.js)
      .pipe(jshint(jshintrc))
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jsFailReporter());
  });

  gulp.task('lint-css', ['lint-setup'], function () {

    swig.log.task('Linting CSS and LESS');

    var recessOpts = {
        strictPropertyOrder: false,
        noOverqualifying: false
      };

    return gulp.src(paths.css)
      .pipe(buffer())
      .pipe(mock())
      .pipe(recess(recessOpts))
      .on('error', recessReporter.fail)
      .pipe(recessReporter);
  });

  gulp.task('lint-handlebars', ['lint-setup'], function (cb) {
    swig.log.task('Linting Handlebars Templates');

    return gulp.src(paths.templates)
      .pipe(handlebars())
      .on('error', handlebarsReporter.fail)
      .pipe(handlebarsReporter);
  });

  gulp.task('lint-misc', ['lint-setup'], function () {
    swig.log.task('Linting Other Bits');
    return gulp.src(paths.js)
      .pipe(packageVersion());
  });

  // TODO:
  // module name
  // special
  // js and less dependencies

  gulp.task('lint', function (cb) {
    swig.seq('lint-script', 'lint-misc', 'lint-css', 'lint-handlebars', cb);
  });
};