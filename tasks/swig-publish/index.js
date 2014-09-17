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
    rimraf = require('rimraf'),
    co = require('co'),

    targetPath;

  gulp.task('publish-verify', function publishVerifyTask () {

    if (!swig.argv.module) {
      swig.error('publish-verify', 'You must define a module to publish.');
    }

    targetPath = swig.target.path;

    if (!fs.existsSync(targetPath)) {
      swig.error('publish-verify', 'The module specified doesn\'t exist here.');
    }

    var pkgPath = path.join(targetPath, '/package.json');

    if (!fs.existsSync(pkgPath)) {
      swig.error('publish-verify', 'You cannot publish a module without a package.json file.');
    }

  });

  gulp.task('publish-npm', function publisNpmTask () {

    var tempPath = path.join(swig.temp, '/publish/', swig.argv.module),
      result;

    if (fs.existsSync(tempPath)) {
      rimraf.sync(path.normalize(file));
    }

    swig.fs.mkdir(tempPath);
    swig.fs.copyAll(targetpath, tempPath);

    glob.sync(path.join(tempPath, '/**/.DS_Store'), function (file) {
      fs.unlinkSync(file);
    });

    glob.sync(path.join(tempPath, '/**/*'), co(function * (file) {
      result = yield swig.exec('xattr -c ' + file);
    }));

    result = swig.exec('npm publish --prefix=' + tempPath);

    if (result.stderr.length) {
      result.stderr = result.stderr.split('\n')
      result.stderr = '  ' + result.stderr.join('\n  ') + '\n';

      swig.error('publish-npm', 'npm publish error\nstderr:\n' + result.stderr);
    }

  });

  gulp.task('publish-tag', co(function * publishTagTask () {

    var tempPath = path.join(swig.temp, '/publish/', swig.argv.module),
      pkg = require(path.join(tempPath, '/package.json')),
      git = require('simple-git')(tempPath),
      tagName = pkg.name + '-' + pkg.version,
      result;

    git.exec = thunkify(git._run);

    result = yield git.exec('git fetch --tags');
    result = yield git.exec('git tag ' + tagName);
    result = yield git.exec('git push --tags');
  }));

  gulp.task('publish-email', function publishEmailTask () {

  });

  gulp.task('publish',
    [
      'publish-verify',
      'lint',
      'spec',
      // 'publish-npm',
      // 'publish-tag',
      // 'publish-email'
    ]);

};
