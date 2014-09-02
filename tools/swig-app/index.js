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

  var path = require('path'),
    exec = require('child_process').exec,
    fs = require('fs'),
    _ = require('underscore'),

    node = {
      command: 'GILT_ENV=development nvm run 0.11 --harmony app',
      valid: function () {
        var pkg = require(path.join(process.cwd(), 'package.json')),
          errors = [];

        if (!pkg) {
          errors.push('  package.json not found!');
        }
        else {
          if (!pkg.name) {
            errors.push('  package.json Name missing!');
          }

          if (!pkg.version) {
            errors.push('  package.json Version missing!');
          }

          if (!pkg.description) {
            errors.push('  package.json Description missing!');
          }
        }

        return errors;
      },
      exists: function () {
        swig.log('Looking for app.js...');
        return fs.existsSync(path.join(process.cwd(), 'app.js'));
      }
    };

  function run () {
    var cp = exec(command, function (error, stdout, stderr){

      if (error) {
        swig.log('swig-app Error:\n');
        swig.log(error);
      }

      if (stderr) {
        swig.log(stderr);
      }
    });

    (function capture (stdout) {
      stdout.on('data', function (data) {
        swig.log(data);
      });
    })(cp.stdout);

    // handles CTL+C so that only the node.js instance is exited and not gulp.
    process.on('SIGINT', function() {
      cp.kill();
    });
  }

  gulp.task('app', ['zk'], function () {

    var errors;

    swig.log('NOTE: Currently this tool is limited to node.js apps.');

    if (node.exists()) {
      errors = node.valid();
      if (!errors.length) {
        run();
      }
      else {
        swig.log('Couldn\'nt start your app due to the following:\n' + errors.join('\n'));
      }
    }
    else {
      swig.log('No node.js apps found in this directory.');
    }

  });

};