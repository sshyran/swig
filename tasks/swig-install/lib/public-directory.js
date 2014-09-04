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

// handles building of the /public assets directory
module.exports = function (gulp, swig) {

  var glob = require('glob'),
    modules = {},
    azModules = [];

  // remove everything in /public except for /public/src and /public/main.less
  function clean () {
    var rimraf = require('gulp-rimraf');

    swig.log('Cleaning the /public directory...');

    gulp.src(['./public/**', '!./src/**', '!./**/main.less'], { read: false })
      .pipe(rimraf({ force: true }));
  }

  // find and compile a list of all unique modules, and their paths
  function compile () {

    swig.log('Compiling module list...');

    var modPaths = glob.sync(path.join(tempPath, '/**/node_modules')),
      dirs;

    modPaths.forEach(function (path) {
      dirs = fs.readdirSync(path);
      dirs.forEach(function (file){
        dirPath = path + '/' + file;
        if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
          azModules.push({ name: file, path: dirPath });
        }
      });
    });

    // and now we pretty sort a-z for various output
    // we dont reset azModules to the sorted array because we need it dirty for deps.less
    _.sortBy(azModules, function (mod) { return mod.name; }).forEach(function (mod) {
      modules[mod.name] = mod.path;
    });
  }

  function copy () {

    swig.log('Copying modules to /public...');

    _.each(modules, function (modPath, name) {
      modPathName = name.replace(/\./g, '/');

      _.each(paths, function (p, pathName) {
        sourcePath = path.join(modPath, pathName);

        if (fs.existsSync(sourcePath)) {
          destPath = path.join(p, modPathName);
          swig.fs.mkdir(dirPath);
          swig.fs.copyAll(sourcePath, destPath);
        }
      })
    });
  }

  function manifest () {
    // re-prep the modules hash with version numbers instead of paths
    _.each(modules, function (mod, name) {
      pkg = require(path.join(mod, '/package.json'));
      modules[name] = pkg.version;
    });

    fs.writeFileSync(path.join(paths.js, 'manifest.json'), JSON.stringify({ generated: now, dependencies: modules }, null, 2));
    grunt.reporter.success('Writing manifest.json');
  }

  function replace () {
    var content;

    swig.log('Replacing Public Repo Name in CSS');

    glob.sync(path.join(paths.css, '/**/*.css')).forEach(function (file) {
      content = fs.readFileSync(file, { encoding: 'utf-8' });

      var matches = content.match(/\$\$PUBLIC\_REPO\_NAME\$\$/g);

      if (matches && matches.length) {
        content = content.replace(/\$\$PUBLIC\_REPO\_NAME\$\$/g, swig.pkg.name);
        fs.writeFileSync(file, content);
        swig.log('  Writing: ' + file.grey);
      }
    });
  }

  function vendor () {
    var destPath;

    swig.log('Copying internal modules to vendor/common');

    glob.sync(path.join(paths.js, '/internal/**/*.js')).forEach(function (file) {
      destPath = path.join(paths.js, '/vendor/common/', path.basename(file));

      if (!fs.existsSync(path.dirname(destPath))) {
        swig.fs.mkdir(path.dirname(destPath));
      }

      fs.linkSync(file, destPath);
    });
  }

  return function process () {

    var pkg = swig.pkg,
      paths = { pub: path.join(process.cwd(), '/public') };

    if (pkg.name) {
      paths = {
        css: path.join(paths.pub, '/css/', pkg.name),
        img: path.join(paths.pub, '/img/', pkg.name),
        js: path.join(paths.pub, '/js/', pkg.name),
        templates: path.join(paths.pub, '/templates/', pkg.name)
      };
    }

    clean();
    compile();
    copy();
    manifest();
    require('./lib/less')(gulp, swig, paths, azModules);
    replace();
    vendor();
    require('./lib/main-js')(gulp, swig, paths);

  };
};
