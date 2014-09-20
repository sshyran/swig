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

module.exports = function (swig) {

  var _ = require('underscore'),
    hooker = require('hooker'),
    symbols = require('log-symbols'),
    readline = require('readline'),
    sprintf = require('sprintf').sprintf,
    strip = require('strip-ansi'),
    thunkify = require('thunkify');

  require('colors');
  '┤├';

  symbols.connector = ' ▸ ';

  if (swig.env === 'production' || swig.argv.pretty === false) {
    symbols.info = '[info]';
    symbols.warning = '[warn]';
    symbols.error = '[err ]';
    symbols.connector = ' : ';
  }

  if (swig.env === 'development' && !swig.argv.poolparty) {
    var oldLog = console.log;

    // gulp-util.log always starts each log with [00:00:00]
    // we're suppressing that output if on a dev machine.
    console.log = function () {
      var args = Array.prototype.slice.call(arguments);

      if (/^\[\d\d\:\d\d:\d\d\]/.test(strip(args[0]))) {
        return;
      }

      oldLog.apply(console, args);
    }
  }

  function puts (what) {

    var prefix = '  ';

    what = what || '';

    var parts = what.split('\n');

    if (parts.length > 1) {
      what = parts.join('\n' + prefix)
    }

    if (swig.env === 'production' || swig.argv.pretty === false) {
      what = strip(what);
    }

    console.log(prefix + what);
  }

  puts = _.extend(puts, {

    verbose: function (prefix, what) {
      if (swig.argv.verbose) {
        puts(what);
      }
    },

    info: function (prefix, what) {
      prefix = ' ' + prefix + symbols.connector;
      puts(strip(symbols.info).cyan + prefix.cyan + what);
    },

    warn: function (prefix, what) {
      prefix = '  ' + prefix + symbols.connector;
      puts(symbols.warning + prefix.yellow + what);
    },

    error: function (prefix, what) {
      prefix = ' ' + prefix + symbols.connector;
      puts(symbols.error + prefix.red + what);
    },

    confirm: thunkify(function (question, callback) {
      var iface = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        }),
        result;

      iface.question(question + ' ', function (answer) {
        iface.close();

        answer = answer || 'n';
        answer = answer.toLowerCase();

        result = answer.substring(0, 1) === 'y';

        callback(null, result);
      });
    })

  });

  return puts;
};
