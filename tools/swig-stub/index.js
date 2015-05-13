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
    co = require('co'),
    gutil = require('gulp-util'),
    prettyjson = require('prettyjson'),
    stubs = require('./lib/stubs'),
    inquirer = require('inquirer'),

    prompts = {
      type: 'Please enter the type of thing you\'d like to stub',
      name: 'Please enter the name of the thing',
      description: 'Please enter the description of the thing',
      port: 'Please enter the port this thing should run on',
      alias: 'If you\'d like this to have a directory alias (eg. /thing), please enter it (otherwise press return):',
      navigation: 'Should this render the navigation/header?',
      footer: 'Should this render the footer?',
      continue: 'Does everything look OK?'
    },
    stubTypes = {
      node: 'NodeJS Web App',
      module: 'UI Module'
    };

  gulp.task('stub', function (done) {

    // if we're running stub in the user root, remap the taget path
    if (process.cwd() === process.env['HOME']) {
      swig.target.path = path.join(swig.target.path, '/Code/web');
    }

    function answers (data) {

      data.type = _.findKey(stubTypes, function (value) { return value === data.type; });

      swig.log();
      swig.log('Here\'s the data we\'ve collected:');
      swig.log(prettyjson.render(data));
      swig.log();

      inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: prompts.continue,
          filter: filter
        }
      ], function (answers) {
        if (answers.continue) {
          return doit(data, done);
        }
        else {
          swig.log();
          swig.log.error('swig-stub', 'Maybe next time, then.');

          done();
        }
      });
    }

    function filter (value) {
      return value.toLowerCase();
    }

    function validate (value) {
      return value && value.length ? true : 'Hey bub, you have to enter a value';
    }

    function validatePort (value) {
      return !!value && !isNaN(value) && value.toString().length > 3  && parseInt(value) > 0 ?
              true :
              'Hey bub, you have to enter a valid port';
    }

    function doit (data, done) {
      var destPath = path.join(swig.target.path, data.name),
        installCommand = 'npm install --tag=null --loglevel=warn 2>&1',
        destPath,
        stream;



      stream = gulp
        .src(path.join(__dirname, 'templates', data.type, '/**/*'))
        .pipe(stubs(swig, data))
        .pipe(gulp.dest(destPath))
        .on('end', co(function * exit () {

          // ask about installing swig, npm
          swig.log();
          var result = yield swig.log.prompt('We\'re ready to install your NPM modules. Press return to begin...');
          swig.log();

          swig.log.info('', 'Starting `npm install`...\n');
          result = yield swig.exec('cd ' + destPath + '; ' + installCommand, null, {
            stdout: function (data) {
              swig.log(data.trim().grey);
            }
          });

          swig.log();

          if (result.stdout.indexOf('not ok') > -1){
            swig.log.error('swig-stub', 'One or more modules failed to install from npm.\n ' +
              swig.log.padLeft('For more info, look here: ' + path.join(destPath, 'npm_debug.log').grey, 7));
            return;
          }

          swig.log();
          swig.log.success('', 'Your app is now setup, run `swig install` and go nuts!\n');
          done();

        }));

      return stream;
    }

    inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: prompts.type,
        choices: _.values(stubTypes)
      },
      {
        type: 'input',
        name: 'name',
        message: prompts.name,
        filter: filter,
        validate: validate
      },
      {
        type: 'input',
        name: 'description',
        message: prompts.description,
        filter: filter,
        validate: validate
      },
      {
        type: 'input',
        name: 'port',
        message: prompts.port,
        validate: validatePort
      },
      {
        type: 'input',
        name: 'alias',
        message: prompts.alias,
        filter: filter
      },
      {
        type: 'confirm',
        name: 'navigation',
        message: prompts.navigation,
        filter: filter
      },
      {
        type: 'confirm',
        name: 'footer',
        message: prompts.footer,
        filter: filter
      }
    ], answers);

  });

};
