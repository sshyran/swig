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

// creates main.js
module.exports = function (gulp, swig, paths) {

  // main.js
  var glob = require('glob'),
    path = require('path'),
    fs = require('fs'),
    content = '/* Generated: ' + now + '\n   This file is auto-generated during ui:install\n   It is inadvisable to write to it directly */\n',
      + require('swig-install/templates/main-js.handlebars'), //fs.readFileSync(path.join(grunt.config.get('grunt.basePath'), '/templates/main-js.handlebars'), { encoding: 'utf-8' });
    files = '',
    destPath,
    pkg,
    configDeps;

  glob.sync(path.join(paths.js, '/vendor/common/{require,require_wrapper,json}.js')).forEach(function (file) {
    files += fs.readFileSync(file, { encoding: 'utf-8' }) + '\n';
  });

  glob.sync(path.join(swig.temp, '/**/node_modules/**/package.json')).forEach(function (file) {
    pkg = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }));
    if (pkg.configDependencies) {
      configDeps = _.extend(configDeps, pkg.configDependencies);
    }
  });

  // TEMPORARY
  configDeps['config.jsBasePath'] = '/a/js/' + appPackage.name + '/';

  // yes I know we're not using handlebars here, but that's really overkill
  content = content.replace('{{files}}', files);
  content = content.replace('{{configs}}', JSON.stringify(configDeps, null, '  '));

  fs.writeFileSync(path.join(paths.js, 'main.js'), content);

  swig.log('Writing main.js.');

  swig.log('Copying less helpers common/helpers.');

  glob.sync(path.join(paths.css, '/less/helpers/*.less')).forEach(function (file) {
    destPath = path.join(paths.css, '/common/helpers/', path.basename(file));

    if (!fs.existsSync(path.dirname(destPath))) {
      mkdir(path.dirname(destPath));
    }

    fs.linkSync(file, destPath);
  });

};