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

function load (moduleName) {
  var module = require(moduleName)(gulp, swig),

  module.pkg = require(moduleName + '/package.json');

  try {
    module.swigInfo = require(moduleName + '/swig.json');
  }
  catch (e) {
    if (!e.code == 'MODULE_NOT_FOUND') {
      throw e;
    }
  }

  return module;
}

var gulp = require('gulp'),
  _ = require('underscore'),
  argv = require('yargs').argv,
  taskName = argv._.length > 0 ? argv._[0] : 'default',
  swig = {
    gulp: gulp,
    util: require('swig-util')(swig),
    log: require('swig-log')(swig),
    argv: argv
  };

swig = _.extend(swig, {
  tools: {
    app: load('swig-app'),
    init: load('swig-init'),
    tunnel: load('swig-tunnel')
  }
});

// if the requested task is a tool, stop loading things.
if (_.has(swig.tools, taskName)) {
  return swig;
}

swig = _.extend(swig, {
  tasks: {
    'default': load('swig-default'),
    install: load('swig-install')
  }
})

module.exports = swig;
