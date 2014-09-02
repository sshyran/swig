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
    fs = require('fs'),
    exec = require('co-exec'),
    co = require('co'),
    buffer,
    errors;

  function * local() {
    var output = yield exec('npm install');
    swig.log(output);
  }

  function * ui () {
    var pkg = require(path.join(process.cwd, 'package.json')),
      json = JSON.stringify(pkg, null, 2);

    if (!pkg) {
      swig.log('Could\nt find package.json, not installing uiDependencies.');
      return;
    }
    else if (!pkg.uiDependencies) {
      swig.log('package.json doens\'nt contain any uiDependencies.');
      return;
    }

    pkg.dependencies = pkg.uiDependencies;
    fs.writeFileSync(path.join(swig.tempDir, 'package.json'), json);

    var commands = [
      'cd ' + swig.tempDir,
      'rm -rf node_modules',
      'npm install'
    ];

    var output = yield exec(commands.join('; '));
    swig.log(output);
  }

  gulp.task('install', co(function *() {

    try {
      yield local();
      yield ui();
    }
    catch (e) {
      swig.log('error:');
      swig.log(e);
    }

  }));
};