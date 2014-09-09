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
    installCommand = 'npm install --loglevel=info',
    buffer,
    errors;

  function * local() {
    swig.log(installCommand);

    // TODO: this needs to be streamed so we can let the user
    // know what's going on in real time.

    var output = yield exec(installCommand);
    swig.log(output);
  }

  function * ui () {
    var pkg = swig.pkg,
      json = JSON.stringify(pkg, null, 2);

    if (!pkg) {
      swig.log('Could\nt find package.json, not installing uiDependencies.');
      return;
    }
    else if (!pkg.uiDependencies) {
      swig.log('package.json doens\'nt contain any uiDependencies.');
      return;
    }

    var commands = [
      'cd ' + swig.temp,
      'rm -rf node_modules',
      'npm install --loglevel=info'
    ];

    // TODO: this needs to be streamed so we can let the user
    // know what's going on in real time.
    var output = yield exec(commands.join('; '));
    swig.log(output);
  }

  gulp.task('install', co(function *() {

    var processPublic = require('./lib/public-directory')(gulp, swig),
      packageMerge = require('./lib/package-merge')(gulp, swig),
      mergeModules = require('./lib/merge-modules')(gulp, swig);

    try {
      packageMerge();
      // yield local();
      yield ui();
      mergeModules();
      processPublic();
    }
    catch (e) {
      swig.log('error:');
      swig.log(e);
    }

  }));
};