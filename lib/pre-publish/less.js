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
    log.error('', 'The temporary directory for `swig install` doesn\'t exist, and this tool cannot continue.');
    process.exit(1);
  }

  files = glob.sync([path.join(cwd, targetPath, '**/*.less')]);

  options.paths.push(path.join(cwd, targetPath));

  if (!files.length) {
    log.info('', 'No files to render!');
    return;
  }

  // so we found out from ui-build that it does this to enforce that the
  // mixins in less.helpers override anything found elsewhere. as of 11/13/15
  // less.gilt/utilities.less has mixins with the same name which are older
  // and do less than those in less.helpers. fun stuff.
  log.info('note', 'Each file is prepended with an @import of less.helpers.');

  files.forEach(function (filePath) {
    var contents = fs.readFileSync(filePath, encoding),
      output;

    contents = '@import \'common/helpers/helpers.less\';\n' + contents;

    log.info('', 'Rendering: ' + path.basename(filePath).grey);

    less.render(contents, options)
      .then(function (res) {
        output = res.css;
        filePath = path.join(path.dirname(filePath), path.basename(filePath, '.less') + '.css');

        log.verbose('', 'Writing: ' + filePath.grey);
        fs.writeFileSync(filePath, output, encoding);

        // DEPRECATED: fs.unlinkSync(filePath);
        // we used to remove the source .less file from the package before publish
        // since it doesn't hurt anything to remain in the package, we're going to
        // leave it there for reference.
      },
      function (err) {
        // Convert the keys so PluginError can read them
        err.lineNumber = err.line;
        err.fileName = err.filename;

        // Add a better error message
        err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

        log();
        log(err);
        log();

        log.error('less.render', err);

        process.exit(1);
      });
  });
};
