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

  var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    glob = require('globby'),
    rimraf = require('rimraf'),
    thunkify = require('thunkify'),
    co = require('co'),

    npmCommand,
    targetPath,
    files;

  gulp.task('publish-verify', function publishVerifyTask (cb) {

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

    cb();

  });

  gulp.task('publish-npm', function publisNpmTask (cb) {

    var tempPath = path.join(swig.temp, '/publish/', swig.argv.module),
      result,
      streamResult;

    if (fs.existsSync(tempPath)) {
      rimraf.sync(path.normalize(tempPath));
    }

    swig.fs.mkdir(tempPath);
    swig.fs.copyAll(targetPath, tempPath);

    files = glob.sync(path.join(tempPath, '/**/.DS_Store'));

    _.each(files, function (file) {
      fs.unlinkSync(file);
    });

    files = glob.sync(path.join(tempPath, '/**/*'));

    _.each(files, co(function * (file) {
      swig.log('Removing extended attributes from: ' + file.replace(tempPath, '').grey);
      result = yield swig.exec('xattr -c ' + file);
    }));

    co(function * () {

      // run npm against the temp module location, redirect stderr to stdout
      npmCommand = 'npm publish ' + tempPath + ' --tag=null --loglevel=info 2>&1';

      swig.log('[swig-publish]'.yellow + ' executing npm command:\n' + npmCommand.grey);

      result = yield swig.exec(npmCommand, null, {
        stdout: function (data) {
          streamResult += data;
        }
      });

      if (result.stdout.indexOf('npm info ok')) {
        swig.log('[swig-publish]'.green + ' npm publish suceeded.');
      }
      else {
        swig.log('[stdout] '.blue + streamResult);
        swig.log('[swig-publish]'.red + ' npm publish failed.');
      }

      cb();
    })(function (err, res) {
      if (err) {
        swig.log('[stdout] '.blue + streamResult);
        swig.log('[swig-publish]'.red + ' npm publish failed.');
        cb();
      }
    });

  });

  gulp.task('publish-tag', function publishTagTask (cb) {

    var tempPath = path.join(swig.temp, '/publish/', swig.argv.module),
      pkg = require(path.join(tempPath, '/package.json')),
      git = require('simple-git')(tempPath),
      tagName = pkg.name + '-' + pkg.version,
      result;

    git.exec = thunkify(git._run);

    co(function * () {
      swig.log('[swig-publish:publish-tag]'.yellow + ' fetching tags...');
      result = yield git.exec('fetch --tags');

      swig.log('[swig-publish:publish-tag]'.yellow + ' tagging: ' + tagName);
      result = yield git.exec('tag ' + tagName);

      swig.log('[swig-publish:publish-tag]'.yellow + ' pushing tags...');
      result = yield git.exec('push --tags');
    })(function (err) {
      if (err) {
        swig.log('[swig-publish:publish-tag]'.red + ' failed to tag: ' + (pkg.name + '@' + pkg.version).magenta);
      }
      cb();
    });

  });

  gulp.task('publish-email', function publishEmailTask (cb) {
    cb();
  });

  gulp.task('publish', function (cb) {
    swig.seq(
      'publish-verify',
      'lint',
      'spec',
      'publish-npm',
      'publish-tag',
      'publish-email',
      cb);
  });

};
