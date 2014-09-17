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

    mock = require('./lib/mock')(gulp, swig),
    recessReporter = require('./lib/recess-reporter')(gulp, swig),
    jsFailReporter = require('./lib/jshint-fail-reporter')(gulp, swig),

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

    cb();
  });

  gulp.task('lint-script', ['lint-setup'], function () {
    var jshintrc = path.join(__dirname, '.jshintrc');

    return gulp.src(paths.js)
      .pipe(jshint(jshintrc))
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jsFailReporter());
  });

  gulp.task('lint-css', ['lint-setup'], function () {

    var recessOpts = {
        strictPropertyOrder: false,
        noOverqualifying: false
      };

    return gulp.src(paths.css)
      .pipe(buffer())
      .pipe(mock())
      .pipe(recess(recessOpts))
      .pipe(recessReporter);
  });

  gulp.task('lint-handlebars', ['lint-setup'], function (cb) {
    return gulp.src(paths.templates)
      .pipe(handlebars());

    // TODO: reporter - https://github.com/lazd/gulp-handlebars/issues/34
  });

  // TODO:
  // module name
  // special
  // package version
  // js and less dependencies

  gulp.task('lint', function (cb) {
    swig.seq('lint-script', 'lint-css', 'lint-handlebars', cb);
  });
};