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

module.exports = function (gulp, swig) {

  var fs = require('fs'),
    path = require('path'),
    glob = require('globby'),
    xattr = require('xattr'),
    rimraf = require('rimraf'),
    thunkify = require('thunkify'),
    co = require('co'),
    exec = require('co-exec'),

    moduleName,
    targetPath;

  gulp.task('publish-verify', function publishVerifyTask (callback) {

    if (!swig.argv.module) {
      callback('[error] You must define a module to publish.');
      return false;
    }

    moduleName = swig.argv.module.split('.').join('/');
    targetPath = path.join(swig.target.path, '/src/', moduleName);

    var pkgPath = path.join(targetPath, '/package.json');

    if (!fs.existsSync(pkgPath)) {
      callback('[error] You cannot publish a module without a package.json file.');
      return false;
    }

  });

  gulp.task('publish-npm', co(function * publisNpmTask () {

    var tempPath = path.join(swig.temp, '/publish/', swig.argv.module);

    if (fs.existsSync(tempPath)) {
      rimraf.sync(path.normalize(file));
    }

    swig.fs.mkdir(tempPath);
    swig.fs.copyAll(targetpath, tempPath);

    glob.sync(path.join(tempPath, '/**/.DS_Store'), function (file) {
      fs.unlinkSync(file);
    });

    glob.sync(path.join(tempPath, '/**/*'), function (file) {
      yield exec('xattr -c ' + file);
    });

   // npm publish --prefix=

  }));

  gulp.task('publish', ['publish-verify', 'spec', 'publish-npm'], function publishTask () {

    var tempPath = path.join(swig.temp, '/publish/', swig.argv.module),
      pkg = require(path.join(tempPath, '/package.json')),
      git = require('simple-git')(tempPath),
      git.exec = thunkify(git._run),
      tagName = pkg.name + '-' + pkg.version,
      result;

    result = yield git.exec('git fetch --tags');
    result = yield git.exec('git tag ' + tagName);
    result = yield git.exec('git push --tags');

  });

};
