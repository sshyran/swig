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

  var _ = require('underscore'),
    fs = require('fs'),
    glob = require('globby'),
    rimraf = require('rimraf'),
    path = require('path'),
    modules = {},
    azModules = [];

  // remove everything in /public except for /public/src and /public/main.less
  function clean () {
    swig.log('Cleaning the /public directory...');

    var paths = [
        './public/**/{target}/**/*',
        '!./public/**/{target}/**/src',
        '!./public/**/{target}/**/src/**/*'
      ],
      files;

    paths = _.map(paths, function (p) { return p.replace('{target}', swig.pkg.name); });
    files = glob.sync(paths);

    swig.log.verbose('[clean] ' + files.length + ' files found at: ');
    swig.log.verbose(paths);

    _.each(files, function (file) {
      swig.log.verbose('[clean] removing: ' + file);
      rimraf.sync(path.normalize(file));
    });
  }

  // find and compile a list of all unique modules, and their paths
  function compile () {

    swig.log('Compiling module list...');

    var modulesPath = path.join(swig.temp, '/**/node_modules'),
      modPaths = glob.sync(modulesPath),
      dirs;

    swig.log.verbose('[compile] searching: ' + modulesPath);
    swig.log.verbose('[compile] found module directories: ' + modPaths.length);

    modPaths.forEach(function (modPath) {
      swig.log.verbose('[compile] compiling: ' + modPath);

      dirs = fs.readdirSync(modPath);

      _.each(dirs, function (dir){
        var dirPath = path.join(modPath, dir);
        if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
          azModules.push({ name: dir, path: dirPath });
        }
      });
    });

    // and now we pretty sort a-z for various output
    // we dont reset azModules to the sorted array because we need it dirty for deps.less
    _.sortBy(azModules, function (mod) { return mod.name; }).forEach(function (mod) {
      modules[mod.name] = mod.path;
    });

    swig.log.verbose('[compile] sorted modules: ');
    swig.log.verbose(modules);
  }

  function copy (paths) {

    swig.log('Copying modules to /public...');
    swig.log.verbose('');

    var destPath,
      sourcePath,
      modPathName;

    _.each(modules, function (modPath, name) {
      modPathName = name.replace(/\./g, '/');

      _.each(paths, function (p, pathName) {
        sourcePath = path.join(modPath, pathName);

        swig.log.verbose('\n[copy] copying: ' + sourcePath);

        if (fs.existsSync(sourcePath)) {
          destPath = path.join(p, modPathName);
          swig.fs.mkdir(destPath);
          swig.fs.copyAll(sourcePath, destPath);
          swig.log.verbose('[copy] copied: ' + destPath);
        }
      })
    });
  }

  function manifest (paths) {
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

  function vendor (paths) {
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

    try {
      var path = require('path'),
        pkg = swig.pkg,
        paths = { pub: path.join(swig.cwd, '/public') };

      if (pkg.name) {
        paths = {
          css: path.join(paths.pub, '/css/', pkg.name),
          img: path.join(paths.pub, '/img/', pkg.name),
          js: path.join(paths.pub, '/js/', pkg.name),
          templates: path.join(paths.pub, '/templates/', pkg.name)
        };
      }
      else {
        swig.log('[install] package.json wasn\'t found or was missing the "name" property.');
        return;
      }

      clean();
      compile();
      copy(paths);
      // manifest(paths);
      // require('./lib/less')(gulp, swig, paths, azModules);
      // replace();
      // vendor(paths);
      // require('./lib/main-js')(gulp, swig, paths);
    }
    catch (e) {
      console.log('ERROR')
      console.log(e);
      console.log(e.stack);
      console.log(e.lineNumber);
    }

  };
};
