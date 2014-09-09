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
    readline = require('readline'),
    thunkify = require('thunkify');

  require('colors');

  function puts (what) {
    console.log(what);
  }

  puts = _.extend(puts, {

    verbose: {
      if (swig.argv.verbose) {
        puts(what);
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
