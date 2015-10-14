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

module.exports = function (log) {
  var _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    glob = require('globby'),
    mustache = require('mustache'),

    cwd = process.cwd(),
    targetPath = 'css',
    encoding = 'utf-8';

  log();
  log.task('Compiling LESS Files')

  glob.sync([path.join(cwd, targetPath, '**/*.less')]).forEach(function (filePath) {
    var contents = fs.readFileSync(filePath, encoding),
      output;

    output = mustache.render(template, data);

    fs.writeFileSync(filePath + 'compiled', output, encoding);
  });
};
