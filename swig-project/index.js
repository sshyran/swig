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

var _ = require('underscore'),
  path = require('path'),
  os = require('os'),
  fs = require('fs'),
  gulp = require('gulp'),
  argv = require('yargs').argv,
  taskName = argv._.length > 0 ? argv._[0] : 'default',
  swig = {
    gulp: gulp,
    argv: argv
  };

function load (moduleName) {

  if (argv.verbose) {
    console.log('Loading: ' + moduleName);
  }

  var module = require(moduleName)(gulp, swig) || {};

  module.path = path.dirname(require.resolve(moduleName));
  module.pkg = require(path.join(module.path, '/package.json'));

  try {
    module.swigInfo = require(path.join(module.path, '/swig.json'));
  }
  catch (e) {
    if (e.code != 'MODULE_NOT_FOUND') {
      throw e;
    }
  }

  return module;
}

swig.util = require('swig-util')(swig);
swig.log = require('swig-log')(swig);

// create swigs's temporary directory;
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

swig = _.extend(swig, {
  tools: {
    app: load('swig-app'),
    'app-registry': load('swig-app-registry'),
    tunnel: load('swig-tunnel'),
    zk: load('swig-zk')
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
});

module.exports = swig;
