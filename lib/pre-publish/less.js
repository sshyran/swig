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
    options = { paths: [ basePath ], relativeUrls: false },
    files;

  log();
  log.task('Rendering LESS to CSS');

  if (!fs.existsSync(basePath)) {
    log.error('', '`swig pre-publish --less` assumes that `swig install` was run as part of a `swig publish` process.');
    log.error('', 'The temporary directory for `swig install` doesn\'nt exist, and this tool cannot continue.');
    process.exit(1);
  }

  files = glob.sync([path.join(cwd, targetPath, '**/*.less')]);

  if (!files.length) {
    log.info('', 'No files to render!');
    return;
  }

  files.forEach(function (filePath) {
    var contents = fs.readFileSync(filePath, encoding),
      output;

    log.info('', 'Rendering: ' + path.basename(filePath).grey);

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
