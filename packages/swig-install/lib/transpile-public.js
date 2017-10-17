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

// Handles babel transpile of installed modules, Reason being that when we
// deploy to canary etc the minification step transpiles everything, but locally
// there's no transpilation, which causes issues in IE11.
module.exports = function (gulp, swig) {
  return function transpilePublic() {
    const path = require('path');
    const babel = require('gulp-babel');
    const tap = require('gulp-tap');
    const paths = [
      './public/js/**/*.js',
      `!./public/js/${swig.pkg.name}/src/**/*`
    ];

    swig.log.task(`Transpiling installed packages in /public/js (excluding ./public/js/${swig.pkg.name}/src/**/*)`);
    swig.log.warn('You only need to do this for local IE11 development/fixes');

    return gulp.src(paths)
      .pipe(tap((file) => {
        swig.log.success('', `Transpiling: ${path.basename(file.path).grey}`);
      }))
      .pipe(babel({
        presets: [['es2015', { modules: false }]]
      }))
      .pipe(gulp.dest('./public/js/'));
  };
};
