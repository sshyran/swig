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

// handles writing of main.less in /public
module.exports = function (gulp, swig, paths, azModules) {

  // dependencies.less should be in topoclogical order, not a-z
  var glob = require('glob'),
    path = require('path'),
    content = '/* Generated: ' + now + '\n   This file is auto-generated during ui:install\n   It is inadvisable to write to it directly */\n',
    modPathName,
    sourcePath;

    _.uniq(azModules, function (mod) { return mod.name; }).forEach(function (mod) {
      modPathName = mod.name.replace(/\./g, '/');
      sourcePath = path.join(mod.path, '/css');

      glob.sync(path.join(sourcePath, '/**/*.*')).forEach(function (file) {
        content += '@import "' + modPathName + '/' + path.relative(sourcePath, file) + '";\n'
      });
    });

    fs.writeFileSync(path.join(paths.css, 'dependencies.less'), content);

    swig.log('Writing dependencies.less');

    if (!fs.existsSync(mainCssPath)) {
      content += '\n@import "dependencies.less";'
      fs.writeFileSync(mainCssPath, content);

      swig.log('Didn\'t find main.less, Writing main.less');
    }

};
