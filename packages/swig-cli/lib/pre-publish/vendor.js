

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
  const path = require('path');
  const fs = require('fs');
  const glob = require('globby');
  const mustache = require('mustache');

  const cwd = process.cwd();
  const targetPath = 'js';
  const encoding = 'utf-8';

  const template = fs.readFileSync(path.join(__dirname, '../../templates/vendor.mustache'), encoding);

  log();
  log.task('Wrapping Vendor Module');

  const files = glob.sync([path.join(cwd, targetPath, '**/*.js')]);

  if (!files.length) {
    log.info('', 'No files to wrap!');
    return;
  }

  files.forEach((filePath) => {
    const data = {
      contents: fs.readFileSync(filePath, encoding)
    };
    const pkg = require(path.join(cwd, 'package.json'));

    data.name = pkg.name.replace('@gilt-tech/', '');
    data.global = pkg.global_var /* legacy */ || pkg.gilt.globalVar || data.name.split('.')[1];

    log.info('', `Rendering:${filePath.grey}`);

    const output = mustache.render(template, data);

    fs.writeFileSync(filePath, output, encoding);
  });
};
