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

    git,
    npmCommand,
    tagName,
    targetPath,
    files;

  gulp.task('publish-verify', function (done) {

    var pkgPath,
      result;

    swig.log.task('Verifying before Publishing');

    git = require('simple-git')(swig.target.path);
    git.exec = thunkify(git._run);
    tagName = swig.pkg.name + '-' + swig.pkg.version;

    swig.log.info('', 'Verifying Arguments');

    if (!swig.argv.module || !swig.argv.m) {
      swig.error('publish-verify', 'You must define a module to publish with either the --module or --m flag.');
      process.exit(1);
    }

    if (!swig.argv.module && swig.argv.m) {
      swig.argv.module = swig.argv.m;
    }

    targetPath = swig.target.path;

    swig.log.info('', 'Verifying Target');

    if (!fs.existsSync(targetPath)) {
      swig.error('publish-verify', 'The ' + swig.argv.module + ' module specified doesn\'t exist here.');
      process.exit(1);
    }

    swig.log.info('', 'Verifying package.json');

    pkgPath = path.join(targetPath, '/package.json');

    if (!fs.existsSync(pkgPath)) {
      swig.error('publish-verify', 'You cannot publish a module without a package.json file.');
      process.exit(1);
    }

    done();
  });

  gulp.task('publish-check-version', ['publish-verify'], co(function * () {

    swig.log('');
    swig.log.task('Checking Module Version');
    swig.log.info('', 'Looking for Git tag: ' + tagName);

    try {

      result = yield git.exec('tag');
      result = result.split('\n');

      if (_.contains(result, tagName)) {
        swig.log.error('publish-verify',
          'It looks like you\'ve already published this module.\n   The tag: ' + tagName + ', already exists.\n' +
          '   If you believe that was in error, you can delete the tag and try again, but tread carefully!'
        );
        process.exit(1);
      }
    }
    catch (e) {
      swig.log.error('[publish-tag]', 'Failed to tag ' + (swig.pkg.name + '@' + swig.pkg.version).magenta + '\n  ' + e);
      process.exit(1);
    }

    swig.log.info('', 'Tag is new. We\'re good to go.');
  }));

  gulp.task('publish-npm', ['publish-check-version'], co(function * () {

    var tempPath = path.join(swig.temp, '/publish/', swig.argv.module),
      tagFlag = '',
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
      swig.log.info('', 'Removing extended attributes from: ' + file.replace(tempPath, '').grey);
      result = yield swig.exec('xattr -c ' + file);
    }));

    // if the version contains a hypen, then assume that we're publishing
    // a test version. this keeps the module from being tagged as `latest`
    // in the registry.
    if (swig.pkg.version.indexOf('-') > 0) {
      tagFlag = ' --tag=test'; // leading space is important
    }

    try {

      // run npm against the temp module location, redirect stderr to stdout
      npmCommand = [
        'cd ' + tempPath,
        'npm publish .' + tagFlag + ' --loglevel=info 2>&1'
      ].join('; ');

      swig.log.info('', 'NPM Command:\n  ' + npmCommand.splt('; ').join(';\n  '));
      swig.log.info('', 'Publishing Module');

      result = yield swig.exec(npmCommand, null, {
        stdout: function (data) {
          streamResult += data;
        }
      });

      if (!result.stdout.indexOf('npm info ok')) {
        swig.log.error('', 'Sad Pandas. Publish Failed.');
        swig.log.info('', 'Command Output:\n    ' + streamResult.split('\n').join('\n    ').grey);
      }
    }
    catch (e) {
      swig.log.error('', 'Sad Pandas. Publish Failed.\n  ' + e);
      swig.log.info('', 'Command Output:\n    ' + streamResult.split('\n').join('\n    ').grey);
      process.exit(1);
    }

  }));

  gulp.task('publish-tag-version', ['publish-npm'], co(function * () {

    swig.log('');
    swig.log.task('Tagging Module Version');

    var result;

    try {

      swig.log.info('', 'Fetching Tags');
      result = yield git.exec('fetch --tags');

      swig.log.info('', 'Tagging: ' + tagName);
      result = yield git.exec('tag ' + tagName);

      swig.log.info('', 'Pushing Tags');
      result = yield git.exec('push --tags');
    }
    catch (e) {
      swig.log.error('[publish-tag-version]', 'Failed to tag ' + (swig.pkg.name + '@' + swig.pkg.version).magenta + '\n  ' + e);
      process.exit(1);
    };

  }));

  /*
   * @note:
   *  Order of Operations
   *    - lint
   *    - spec
   *    - publish-verify
   *    - publish-check-version
   *    - publish-npm
   *    - publish-tag-version
   *    - release-email
  */
  gulp.task('publish-tag-version', function (done) {
    swig.seq(
      'spec',
      'publish-tag-version',
      'release-email',
      done);
  });

};
