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
const bs = require('browser-sync');

module.exports = function (gulp, swig) {
  const path = require('path');
  const less = require('gulp-less');
  const rename = require('gulp-rename');
  const sourcemaps = require('gulp-sourcemaps');
  const postcss = require('gulp-postcss');
  const inlineImports = require('postcss-import');
  const autoprefixer = require('autoprefixer');
  const autoprefixerCfg = {
    // https://github.com/postcss/autoprefixer#options
    browsers: [
      'last 2 versions',
      'ie >= 10',
      'iOS >= 8'
    ],
    // should Autoprefixer [remove outdated] prefixes. Default is true.
    remove: true
  };
  const postcssPlugins = [
    inlineImports,
    autoprefixer(autoprefixerCfg),
  ];

  gulp.task('merge-css', () => {
    const bsInstance = bs[bs.has(swig.target.name) ? 'get' : 'create'](swig.target.name);
    swig.log('');
    swig.log.task('Merging LESS and CSS Files');

    const basePublicPath = path.join(swig.target.path, '/public');
    const basePath = path.join(basePublicPath, '/css', swig.target.name);
    const dest = path.join(basePath, 'bundle');
    const glob = [
      path.join(basePath, '/**/main.less')
    ];

    bsInstance.reload();
    return gulp.src(glob)
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(less({
        paths: [basePublicPath],
        relativeUrls: false
      }))
      .pipe(postcss(postcssPlugins))
      .pipe(rename({ suffix: '.bundle' }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dest));

  });
};
