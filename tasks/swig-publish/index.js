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
    tagName,
    targetPath,
    files;

  gulp.task('publish-verify', function publishVerifyTask (done) {

    swig.log.task('Verifying before Publishing');

    var git = require('simple-git')(swig.target.path),
      result;

    git.exec = thunkify(git._run);
    tagName = swig.pkg.name + '-' + swig.pkg.version;

    if (!swig.argv.module) {
      swig.error('publish-verify', 'You must define a module to publish.');
      process.exit(1);
    }

    targetPath = swig.target.path;

    if (!fs.existsSync(targetPath)) {
      swig.error('publish-verify', 'The module specified doesn\'t exist here.');
      process.exit(1);
    }

    var pkgPath = path.join(targetPath, '/package.json');

    if (!fs.existsSync(pkgPath)) {
      swig.error('publish-verify', 'You cannot publish a module without a package.json file.');
      process.exit(1);
    }

    co(function * () {
      swig.log.info('', 'Checking Tags\n');
      result = yield git.exec('tag');
      result = result.split('\n');

      if (_.contains(result, tagName)) {
        swig.log.error('publish-verify',
          'It looks like you\'ve already published this module.\n   The tag: ' + tagName + ', already exists.\n' +
          '   If you believe that was in error, you can delete the tag and try again, but tread carefully!'
        );
        process.exit(1);
      }

    })(function (err) {
      if (err) {
        swig.log.error('[publish-tag]', 'Failed to tag ' + (swig.pkg.name + '@' + swig.pkg.version).magenta);
        process.exit(1);
      }
      done();
    });
  });

  gulp.task('publish-npm', function publisNpmTask (done) {

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

    })(function (err, res) {
      if (err) {
        swig.log('[stdout] '.blue + streamResult);
        swig.log('[swig-publish]'.red + ' npm publish failed.');
        process.exit(1);
      }
      done();
    });

  });

  gulp.task('publish-tag', function publishTagTask (done) {

    swig.log('');
    swig.log.task('Publishing Tags');

    var git = require('simple-git')(swig.target.path),
      tagName = swig.pkg.name + '-' + swig.pkg.version,
      result;

    git.exec = thunkify(git._run);

    co(function * () {
      swig.log.info('', 'Fetching Tags');
      result = yield git.exec('fetch --tags');

      swig.log.info('', 'Tagging: ' + tagName);
      result = yield git.exec('tag ' + tagName);

      swig.log.info('', 'Pushing Tags');
      result = yield git.exec('push --tags');

    })(function (err) {
      if (err) {
        swig.log.error('[publish-tag]', 'Failed to tag ' + (swig.pkg.name + '@' + swig.pkg.version).magenta);
        process.exit(1);
      }
      done();
    });

  });

  gulp.task('publish', function (done) {
    swig.seq(
      'publish-verify',

      // spec lints before running specs
      'spec',
      // 'publish-npm',
      'publish-tag',
      // 'release-email',
      done);
  });

};
