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
    co = require('co'),
    exec = require('co-exec'),
    path = require('path'),
    globby = require('globby'),
    fs = require('fs'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    mincss = require('gulp-minify-css'),
    tap = require('gulp-tap'),
    // filter = require('gulp-filter'),
    // through = require('through2'),
    basePath = path.join(swig.target.path, '/public/');

  function renameFile (path) {
    path.basename = path.basename.replace('.src', '') + '.min';
    return path;
  }

  gulp.task('minify-js', function () {

    var glob = path.join(basePath, '/js/', swig.target.name, '/*.src.js');

    swig.log.task('Minifying Javascript using Uglify');

    return gulp.src(glob)
      .pipe(tap(function (file) {
        swig.log.info('', 'Minifying: ' + path.basename(file.path).grey);
      }))
      .pipe(uglify())
      .pipe(rename(renameFile))
      .pipe(gulp.dest(path.dirname(glob)))
  });

  gulp.task('minify-css', ['minify-js'], function () {

    var glob = path.join(basePath, '/css/', swig.target.name, '/*.src.css');

    swig.log('');
    swig.log.task('Minifying CSS using CleanCSS');

    return gulp.src(glob)
      .pipe(tap(function (file) {
        swig.log.info('', 'Minifying: ' + path.basename(file.path).grey);
      }))
      .pipe(mincss())
      .pipe(rename(renameFile))
      .pipe(gulp.dest(path.dirname(glob)))
  });

  gulp.task('minify', ['minify-css'], function (done) {
    done();

    // handlebars - handlebars -s -r
  });

};
