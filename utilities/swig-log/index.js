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
    thunkify = require('thunkify');

  require('colors');

  function puts (what, prefix) {

    what = what || '';

    if (prefix) {
      prefix = 'swig:'.cyan + prefix.grey;
    }
    else {
      prefix = 'swig'.cyan;
    }

    if (what.indexOf('\n') > 0 && what.indexOf('\n') < what.length - 1) {
      what = '\n\n' + what;
    }

    console.log('[' + prefix + '] ' + what);
  }

  puts = _.extend(puts, {

    verbose: function (what, prefix) {
      if (swig.argv.verbose) {
        puts(what, prefix);
      }
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
