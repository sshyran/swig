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
    addsrc = require('gulp-add-src'),
    mock = require('./lib/mock')(gulp, swig),
    buffer = require('gulp-buffer'),
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

  gulp.task('lint-setup', function () {

    if (paths) {
      return true;
    }

    // setup our glob paths
    if (swig.project.type === 'webapp') {
      baseName = path.basename(swig.target);
      baseSource = path.join(swig.target, 'public/{type}/', baseName, '/src/**/*.{extension}');
    }
    else {
      baseSource = path.join(swig.target, '/**/*.{extension}');
    }

    paths = {
      js: source('js', 'js'),
      css: source('css', '{css,less}'),
      templates: source('templates', 'handlebars')
    };

    return true;
  });

  gulp.task('lint-script', ['lint-setup'], function () {
    return gulp.src(paths.js)
      .pipe(jshint(path.join(__dirname, '.jshintrc')))
      .pipe(jshint.reporter('jshint-stylish'));
  });

  gulp.task('lint-css', ['lint-setup'], function () {

    var recessOpts = {
        strictPropertyOrder: false,
        noOverqualifying: false
      },
      reporterOpts = {
        fail: false,
        minimal: false
      };

    return gulp.src(paths.css)
      .pipe(buffer())
      .pipe(mock())
      .pipe(recess(recessOpts))
      .pipe(recess.reporter(reporterOpts));
  });

  // handlebars

  // module name
  // special
  // package version
  // js and less dependencies

  gulp.task('lint', ['lint-script', 'lint-css'], function () {
    return true;
  });
};