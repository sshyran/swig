

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
  const babel = require('gulp-babel');
  const path = require('path');
  const tap = require('gulp-tap');
  const plumber = require('gulp-plumber');
  const replace = require('gulp-replace');
  const map = require('gulp-sourcemaps');
  const transformModules = require('./lib/transform-es2015-modules-gilt');
  const basePath = path.join(swig.target.path, '/public/');
  const srcDir = `${swig.target.name}/src/`;
  const dest = 'app/';
  const depsRE = /(gilt\.define|gilt\.require|createModule|requireModule)\(([\w\W]*?)\[([\w\W]*?)\]/;
  const through2 = require('through2');
  const cache = require('gulp-cached');

  function normalizeModuleName(filename) {
    return filename.replace(/\.\.\//g, '')
        .replace(/\.\//, '')
        .replace(/\.jsx$|\.js$/, '')
        .replace(/\//g, '.')
        .replace(/(\.[\w\-_]+)\1$/, '$1');
  }

  function replaceSrc(str) {
    return str.replace(/src\./g, 'app.');
  }

  swig.tell('transpile-scripts', {
    description: 'Transpile ES* scripts into ES5 scripts.'
  });

  gulp.task('transpile-scripts', ['transpile-node'], () => {
    const from = path.join(basePath, '/js/', swig.target.name, '/src/**/*.{js,jsx}');
    const to = path.join(basePath, '/js/', swig.target.name, `/${dest}`);

    swig.log('');
    swig.log.task(`Starting 'transpile-scripts'`);

    let stream = gulp.src(from)
      .pipe(cache('scripts'))
      .pipe(plumber())
      .pipe(map.init({
        loadMaps: true
      }));
    if (swig.argv.verbose) {
      stream = stream.pipe(tap((file) => {
        swig.log.info('', `Transpiling: ${path.basename(file.path)}`);
      }));
    }

    stream = stream.pipe(babel({
      moduleIds: true,
      getModuleId: id => `${dest}${id}`.replace(/\//g, '.'),
      resolveModuleSource: (src, file) => {
        const fullPath = path.resolve(path.dirname(file), src);
        if (fullPath.includes(srcDir)) {
          // NOTE: We can comfortably assume that we are in our src/ folder
          const cleanSrc =
              normalizeModuleName(fullPath.slice(fullPath.indexOf(srcDir) +
              srcDir.length));
          return `${dest}${cleanSrc}`.replace(/\//g, '.');
        }
        // NOTE: We are probably importing some "global" module
        if (fullPath.includes('node_modules')) {
          swig.log.warn('gilt.define limitations do not allow us to correctly import modules from the node_module folder.');
          swig.log.warn('Please, make sure to have this module published in the @gilt-tech ui-vendor repository, before you start to use it,');
        }
        return normalizeModuleName(src);
      },
      plugins: [
        [transformModules, { noMangle: true }]
      ],
      presets: [
        ['latest', { modules: false }], // runs last
        'react', // runs second
        'stage-3', // runs first
      ]
    }))

    // NOTE: Needed for retrocompatibility
    // Changing every "src.*" module id and dependencies to be "app.*"
      .pipe(replace(depsRE, (str, $1, $2, $3) => `${$1}(${replaceSrc($2)}[${replaceSrc($3)}]`))

      .pipe(map.write('.'))
      .pipe(gulp.dest(to))
      .pipe(swig.browserSync ? swig.browserSync.stream({match: '/**/*.js'}) : through2.obj())
      .on('finish', () => {
        swig.log(`${swig.log.padding} 'transpile-scripts' complete.`.grey);
      });
    return stream;
  });

  gulp.task('transpile-node', () => {
    // If we are dealing with something different than an "app"
    // or an app with no "stripFlowTypes" activated, then bail out.
    if (!((swig.pkg.gilt || {}).app || {}).stripFlowTypes) {
      return null;
    }

    const from = path.join(swig.target.path, '/lib/**/*.js');
    const to = path.join(swig.target.path, '/lib_dist');

    swig.log.task(`Starting 'transpile-node'`);

    let stream = gulp.src(from)
      .pipe(cache('scripts'))
      .pipe(plumber());

    if (swig.argv.verbose) {
      stream = stream.pipe(tap((file) => {
        swig.log.info('', `Transpiling: ${path.basename(file.path)} into ${to}`);
      }));
    }
    stream = stream.pipe(babel({
      plugins: ['transform-flow-strip-types']
    }))
      .pipe(gulp.dest(to))
      .pipe(swig.browserSync ? swig.browserSync.stream({match: '**/*.js', once: true}) : through2.obj())
      .on('finish', () => {
        swig.log(`${swig.log.padding} 'transpile-node' complete.`.grey);
      });
    return stream;
  });
};
