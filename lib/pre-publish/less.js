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
    os = require('os'),
    glob = require('globby'),
    less = require('less'),

    cwd = process.cwd(),
    pkg = require(cwd + '/package.json'),
    targetPath = 'css',
    encoding = 'utf-8',
    packageName = pkg.name.replace('@gilt-tech/', ''),
    basePath = path.join(os.tmpdir(), 'swig/install', packageName, '/public/css/', packageName),
    options = { paths: [ basePath ], relativeUrls: false };

  log();
  log.task('Compiling LESS Files')

  glob.sync([path.join(cwd, targetPath, '**/*.less')]).forEach(function (filePath) {
    var contents = fs.readFileSync(filePath, encoding),
      output;

    log.info('', 'Rendering: ' + path.basename(filePath));

    less.render(contents, options)
      .then(function (res) {
        output = res.css;
        filePath = path.join(path.dirname(filePath), path.basename(filePath, '.less') + '.css');

        fs.writeFileSync(filePath, output, encoding);
      })
      .catch(function (err) {
        // Convert the keys so PluginError can read them
        err.lineNumber = err.line;
        err.fileName = err.filename;

        // Add a better error message
        err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

        throw err;
      });
  });
};
