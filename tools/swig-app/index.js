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
      command: 'GILT_ENV=development; source ~/.nvm/nvm.sh; nvm run 0.11 --harmony app',
      valid: function () {
        var pkg = swig.pkg,
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
        swig.log.task('Looking for app.js');
        return fs.existsSync(path.join(process.cwd(), 'app.js'));
      }
    };

  function run (cb) {
    var cp = exec(node.command, function (error, stdout, stderr){

      if (error) {
        if (error.signal && error.signal === 'SIGTERM') {
          swig.log.success(null, 'Terminating App');
        }
        else {
          swig.log.error('swig-app', 'Error:');
          swig.log(error);
        }
      }

      if (stderr) {
        swig.log(stderr.trim());
      }
    });

    (function capture (stdout) {
      stdout.on('data', function (data) {
        process.stdout.write(data);
      });
    })(cp.stdout);

    // handles CTL+C so that only the node.js instance is exited and not gulp.
    process.on('SIGINT', function () {
      cp.kill();
    });

    process.on('exit', function () {
      cb();
    });
  }

  gulp.task('app', ['zk'], function (cb) {

    var errors;

    swig.log();
    swig.log('NOTE:'.yellow + ' Currently this tool is limited to node.js apps.\n');

    if (node.exists()) {
      swig.log.task('Checking validity of the app');
      errors = node.valid();
      if (!errors.length) {
        swig.log.task('Running app');
        swig.log();
        run(cb);
      }
      else {
        swig.log.error('swig-app', 'Couldn\'nt start your app due to the following:\n' + errors.join('\n'));
      }
    }
    else {
      swig.log.error('swig-app', 'No node.js apps found in this directory.');
    }

  });

};
