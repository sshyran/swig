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


  NOTICE: These tools assume that they are operating on files in a TEMPORARY PATH,
          that files are expendable and that no cleanup is necessary.
*/

var _ = require('underscore'),
  path = require('path'),
  fs = require('fs'),
  argv = require('yargs').argv,

  // this is a big hack
  log = require('@gilt-tech/swig-util/lib/log')({ env: 'development', argv: {} }),

  rPublish = /^(run\s?)?pu(b(l(i(sh?)?)?)?)?$/;

require('colors');

function bail (){
  log('\nPre-publish tasks only run when triggered by `npm publish`.');
  process.exit(1);
}

// test to see if we're in the pre-publish task as a result of `npm publish`
if (!argv.force) {
  try {
    var npm_config_argv = JSON.parse(process.env.npm_config_argv);
  } catch (e) {
    bail();
  }

  /*jshint -W018 */
  if (typeof npm_config_argv !== 'object' || !npm_config_argv.cooked || !npm_config_argv.cooked instanceof Array) {
    bail();
  }

  var arg;
  while ((arg = npm_config_argv.cooked.shift()) !== undefined) {
    arg = arg.trim();

    if (/^-/.test(arg)){
      continue;
    }

    if (rPublish.test(arg)) {
      break;
    }

    bail();
  }
}

if (argv.vendor) {
  require('./vendor')(log);
}

if (argv.less) {
  require('./less')(log);
}
