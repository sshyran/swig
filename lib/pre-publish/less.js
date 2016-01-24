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
    fsx = require('fs-extra'),
    os = require('os'),
    glob = require('globby'),
    less = require('less'),

    // (tmpdir)/swig/publish/(module.name)
    cwd = process.cwd(),

    pkg = require(cwd + '/package.json'),
    targetPath = 'css',
    encoding = 'utf-8',
    packageName = pkg.name.replace('@gilt-tech/', ''),
    publishPath = cwd,
    cssPath = path.join(publishPath, targetPath),

    // (tmpdir)/swig/publish/(module.name)/../../install/(module.name)
    installPath = path.join(cwd, '../../install', packageName, '/public/css/', packageName),

    _lessPath = path.join(publishPath, '_less'),
    options = { paths: [ installPath ], relativeUrls: false },
    imports = [],
    cssFiles,
    lessFiles;

  log();
  log.task('Rendering LESS to CSS');

  if (!fs.existsSync(installPath)) {
    log.error('', '`swig pre-publish --less` assumes that `swig install` was run as part of a `swig publish` process.');
    log.error('', 'The temporary directory for `swig install` doesn\'t exist, and this tool cannot continue.');
    process.exit(1);
  }

  options.paths.push(_lessPath);

  if (!fs.existsSync(_lessPath)) {
    fsx.mkdirsSync(_lessPath);
  }

  cssFiles = glob.sync([path.join(cssPath, '**/*.less')]);

  if (!cssFiles.length) {
    log.info('', 'No files to render!');
    return;
  }

  // we scan each file for imports, and add those imports to a array
  // we'll reference that array so we're not creating duplicate css
  // and not rendering less files which are solely dependencies of other files.
  cssFiles.forEach(function (filePath) {
    var contents = fs.readFileSync(filePath, encoding),
      matches = contents.match(/@import(.+)/gm),
      imprt;

    if (matches) {
      matches.forEach(function (m) {
        imprt = m.match(/@import\s(\"|\')(.+)(\"|\')/);

        // ["@import 'dialog.less'", "'", "dialog.less", "'"]
        if (imprt && imprt.length === 4) {
          imports.push(imprt[2]);
        }
      });
    }

    // keep the old less file around for reference, debugging
    // but move it to _less/
    log.verbose('Moving to _less: ' + path.basename(filePath).grey);
    fs.renameSync(filePath, path.join(_lessPath, path.basename(filePath)));
  });

  lessFiles = glob.sync([path.join(_lessPath, '**/*.less')]);

  // so we found out from ui-build that it does this to enforce that the
  // mixins in less.helpers override anything found elsewhere. as of 11/13/15
  // less.gilt/utilities.less has mixins with the same name which are older
  // and do less than those in less.helpers. fun stuff.
  log.info('Note', 'Each file is prepended with an @import of less.helpers.');

  lessFiles.forEach(function (filePath) {
    var contents,
      output,
      outputPath;

    if (_.contains(imports, filePath.replace(_lessPath + '/', ''))) {
      // this file is imported by another. we want to ignore it to avoid
      // duplicate code and other issues.
      return;
    }

    contents = fs.readFileSync(filePath, encoding);
    contents = '@import \'common/helpers/helpers.less\';\n' + contents;

    log.info('', 'Rendering: ' + path.basename(filePath).grey);

    less.render(contents, options)
      .then(function (res) {
        output = res.css;
        outputPath = path.join(path.dirname(filePath), path.basename(filePath, '.less') + '.css');
        outputPath = outputPath.replace('/_less/', '/css/');

        log.verbose('Writing: ' + outputPath.grey);
        fs.writeFileSync(outputPath, output, encoding);
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
