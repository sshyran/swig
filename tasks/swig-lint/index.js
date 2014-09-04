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
    baseName,
    source,
    paths;

  // setup our glob paths
  if (swig.project.type === 'webapp') {
    baseName = path.basename(swig.target);
    source = path.join(swig.target, 'public/{type}/', baseName, '/src/**/*.{type}');
  }
  else {
    source = path.join(swig.target, '/**/*.{type}');
  }

  paths = {
    js: source.replace(/\{type\}/g, 'js'),
    css: source.replace(/\{type\}/g, 'css,*.less'),
    templates: source.replace(/\{type\}/g, 'handlebars')
  };

  gulp.task('lint', function () {

    if (!swig.pkg) {
      return;
    }

    var result,
      recessOpts = {
        strictPropertyOrder: false,
        noOverqualifying: false
      };

    recess = gulp.src(paths.js)
      .pipe(jshint(path.join(__dirname, '.jshintrc')))
      .pipe(jshint.reporter('jshint-stylish'));

    result = gulp.src(paths.css)
      .pipe(recess(recessOpts))
      .pipe(recess.reporter());

    return result;
    // handlebars

    // module name
    // special
    // package version
    // js and less dependencies
  });
};