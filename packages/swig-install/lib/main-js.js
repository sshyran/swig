

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
  const _ = require('underscore');
  const glob = require('glob');
  const path = require('path');
  const fs = require('fs');
  const now = (new Date()).toString();
  const preamble = `/* Generated: ${
       now
     }\n   This file is auto-generated during ui:install\n   It is inadvisable to write to it directly */\n`;
  const renderTemplate = require('../templates/main.js');
  let files = '';
  let pkg;
  let configDeps = _.extend({}, swig.pkg.configDependencies);
  let jsBasePath;

  // pull in raw file contents which need to be inserted into the template
  ['require', 'gilt_require', 'json'].forEach((file) => {
    const filePath = path.join(paths.js, '/vendor/common/', `${file}.js`);
    const basename = path.basename(filePath);

    files += `\n// BEGIN: ${basename}\n\n${
              fs.readFileSync(filePath, { encoding: 'utf-8' })}\n\n// END: ${path.basename(file)}\n`;
  });

  // load the config dependencies
  glob.sync(path.join(swig.temp, '/**/node_modules/@gilt-tech/**/package.json')).forEach((file) => {
    pkg = JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }));
    if (pkg.configDependencies) {
      configDeps = _.extend(configDeps, pkg.configDependencies);
    } else if (pkg.gilt && pkg.gilt.configDependencies) {
      configDeps = _.extend(configDeps, pkg.gilt.configDependencies);
    } else if (pkg.gilt && pkg.gilt.configDefaults) {
      configDeps = _.extend(configDeps, pkg.gilt.configDefaults);
    }
  });

  if (swig.argv.module) {
    // modules don't run from server/browser
    // so their basepath shoud point to where the files are 'installed'
    // this allows their specs to load templates and such using XHR
    jsBasePath = paths.js;
  } else {
    jsBasePath = `/a/js/${swig.pkg.name.replace('@gilt-tech/', '')}/`;
  }

  configDeps['config.jsBasePath'] = jsBasePath;
  configDeps['config.js_base_path'] = jsBasePath;

  // handlebars is overkill here, run with a simple replace.
  const mainjs = renderTemplate(preamble, JSON.stringify(configDeps || {}, null, '  '), files);
  const destPath = path.join(paths.js, 'main.js');

  swig.log.info('', 'Writing main.js');
  swig.log.verbose(destPath);
  swig.log();

  fs.writeFileSync(destPath, mainjs);
};
