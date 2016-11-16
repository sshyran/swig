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

module.exports = function(gulp, swig) {
  var _ = require('underscore'),
    argv = require('yargs').argv,
    AWS = require('aws-sdk'),
    execSync = require('child_process').execSync,
    co = require('co'),
    fs = require('fs'),
    semverDiff = require('semver-diff'),
    YAML = require('yamljs'),


    appName = swig.pkg.name,
    deployVersion,
    execSyncOpts = {
      returnOutput: {
        encoding: 'utf8'
      },
      pipeOutput: {
        encoding: 'utf8',
        stdio: 'inherit'
      }
    },
    isNewBuild,
    novayml = YAML.load('./nova.yml'),
    novaEnv,
    novaStack,

    argConfig = {};

  /**
   * @desc  Output help & instructions to console.
   */
  function outputHelp() {
    console.log('');
    console.log('Usage:');
    console.log('swig nova-deploy [options]');
    console.log('');
    console.log('Options:');
    console.log('  --env            Name of environment in nova.yml to deploy to.');
    console.log('  --stack          Name of stack in nova.yml to deploy to.');
    console.log('  --new-version    Deploy a new version, valid options are (patch|minor|major). Version will ');
    console.log('                   be incremented in package.json accordingly and tagged in git.');
    console.log('  --latest-tag     Get the latest version tag on the current');
    console.log('  --version        Specify new version manually. Value should be N.N.N and newer that latest');
    console.log('                   deployed version.');
    console.log('');
    process.exit(0);
  }

  function getLatestVersionTag() {
    return execSync('git tag -l --sort=-v:refname | egrep \'v(?:[0-9].?)+$\' | head -n 1', execSyncOpts.returnOutput);
  }

  function getLatestVersionParsed() {
    return getLatestVersionTag().match(/v((\d+)\.(\d+)\.(\d+))/);
  }

  gulp.task('nova-check-options', function(done) {
    var checkFilesExist = [
        './Dockerfile',
        './.dockerignore',
        './nova.yml'
      ],
      fileNotFound = false,
      gitDiffResult;

    // Check git repo is not 'dirty'

    gitDiffResult = execSync('git diff --shortstat 2> /dev/null | tail -n1', execSyncOpts.returnOutput);
    if (gitDiffResult !== '') {
      swig.log.error('Git repo is ditry, please commit all changes and try again');
      process.exit(1);
    }

    // Check arguments passed to task

    if (argv.latestTag) {
      swig.log.info('Latest version tag is: ' + getLatestVersionTag());
      process.exit(0);
    }

    if (!argv.env || !/\w+/.test(argv.env)) {
      swig.log.error('Missing "--env" option');
      outputHelp();
    }

    if (!argv.stack || !/\w+/.test(argv.stack)) {
      swig.log.error('Missing "--stack" option');
      outputHelp();
    }

    if (argv.version && argv.newVersion || (!argv.newVersion && !argv.version)) {
      swig.log.error('--version or --new-version option is required, they can not be specified together.');
      outputHelp();
    }

    if (!argv.newVersion && /^(?:patch|minor|major)$/.test(argv.newVersion)) {
      swig.log.error('Invalid value specified for --new-version option.');
      outputHelp();
    }

    argConfig = {
      env: argv.env,
      stack: argv.stack,
      newVersion: argv.newVersion,
      version: argv.version
    };

    // Check require files exist

    checkFilesExist.forEach(function(file) {
      if (!fs.existsSync(file)) {
        swig.log.error('Required file ' + file + ' not found.');
        fileNotFound = true;
      }
    });

    if (fileNotFound) {
      process.exit(1);
    }

    novaEnv = _.find(novayml.environments, function(srcEnv) {
      return srcEnv.name === argConfig.env;
    });

    if (!novaEnv) {
      swig.log.error('No environment \'' + argConfig.env + '\' found in nova.yml');
      process.exit(1);
    }

    novaStack = _.find(novaEnv.stacks, function(srcStack) {
      return srcStack.stack_name === argConfig.stack;
    });

    if (!novaStack) {
      swig.log.error('No stack \'' + argConfig.stack + '\' in environment \'' + argConfig.env + '\' found in nova.yml');
      process.exit(1);
    }
    done();
  });

  gulp.task('pull-latest-tags', function() {
    swig.log.info('Fetching latest tags from git');
    execSync('git fetch --tags', execSyncOpts.pipeOutput);
  });

  gulp.task('nova-check-aws-auth', function(done) {
    var s3Client;

    swig.log.info('Using AWS profile: ' + novaEnv.aws_profile);

    AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: novaEnv.aws_profile });

    s3Client = new AWS.S3();

    s3Client.listObjects({
        Bucket: novaEnv.deployment_bucket,
        MaxKeys: 1
    }, function(err, data) {
      if (err) {
        if (err.code === 'ExpiredToken') {
          swig.log.error('AWS token for profile \'' + novaEnv.aws_profile + '\' is expired. Please renew your token and retry.');
          process.exit(1);
        } else {
          // some error has occurred, but it's not an expired token, so we'll try and proceed.
          done();
        }
      } else {
        swig.log.success('Verified AWS connection and token is good.');
        done();
      }
    });
  });

  gulp.task('nova-new-version', function() {
    var vMatch,
      newVersion;

    if (argConfig.newVersion) {

      vMatch = getLatestVersionParsed();

      if (vMatch === null) {
        swig.log.error('Something went wrong parsing the latest git version tag: "' + getLatestVersionTag() + '"');
        swig.log.info('Tip: You can specify the new version manually using --version N.N.N as a workaround');
        process.exit(1);
      }

      vMatch = vMatch.slice(2);
      vMatch = vMatch.map(function(i) {
        return parseInt(i, 10);
      });

      if (argConfig.newVersion === 'major') {
        vMatch[0]++;
        vMatch[1] = vMatch[2] = 0;
      } else if (argConfig.newVersion === 'minor') {
        vMatch[1]++;
        vMatch[2] = 0;
      } else if (argConfig.newVersion === 'patch') {
        vMatch[2]++;
      }

      newVersion = vMatch.join('.');

      swig.log.info('New version after [' + argConfig.newVersion + '] bump: ' + newVersion.green);

      execSync('npm --no-git-tag-version version ' + newVersion);
      swig.pkg.version = newVersion;

      isNewBuild = true;
      deployVersion = newVersion;
    }
  });

  gulp.task('nova-specified-version', function() {
    var versionMatch,
      latestVersion;

    if (argConfig.version) {
      versionMatch = argConfig.version.match(/^((\d+)\.(\d+)\.(\d+))$/);

      if (versionMatch === null) {
        swig.log.error('value passed for version must be in the format N.N.N');
        process.exit(1);
      }

      latestVersion = getLatestVersionParsed();

      if (semverDiff(latestVersion[1], versionMatch[1]) === null) {
        swig.log.error('New version can not be less than latest existing version: ' + latestVersion[1]);
        process.exit(1);
      } else {
        isNewBuild = true;
      }

      if (isNewBuild) {
        execSync('npm --no-git-tag-version version ' + argConfig.version);
        swig.pkg.version = argConfig.version;
      }
      deployVersion = argConfig.version;
    }
  });

  gulp.task('nova-version-cleanup', function() {
    var gitCommands;

    if (isNewBuild) {
      gitCommands = [
        'git add package.json',
        'git tag -a -m "v' + deployVersion + '" v' + deployVersion,
        'git commit -m "autocommit: v' + deployVersion + ' set in package.json"',
        'git push --tags',
        'git push || true'      // If we're on a local branch and don't want to abort the script when 'git push' fails, hence the '|| true' at the end
      ];

      execSync(gitCommands.join(';'), execSyncOpts.pipeOutput);
    }
  });

  gulp.task('nova-build-docker', function() {
    var imageAlreadyExists = execSync('docker images -q ' + appName + ':' + deployVersion, execSyncOpts.returnOutput),
      homeNpmrcPath = process.env.HOME + '/.npmrc',
      localNpmrcPath = './.npmrc';

    if (imageAlreadyExists) {
      swig.log.warn('Docker image with tag [' + appName + ':' + deployVersion + '] already exists, using this.');
    } else {
      try {
        //track if .npmrc file exists in the project folder, so as to know whether to clean it up after the docker container is built.
        var localNpmrc = false;

        if (fs.existsSync(localNpmrcPath)) {
          localNpmrc = true
        } else {
          fs.linkSync(homeNpmrcPath, localNpmrcPath);
        }
        execSync('docker build -t ' + appName + ':' + deployVersion + ' .', _.extend({ stdio: 'pipe' }, execSyncOpts.pipeOutput));

        // remove .npmrc if it didn't exist before the script was run.
        if (!localNpmrc) {
          fs.unlinkSync(localNpmrcPath);
        }
      } catch (e) {
        swig.log.error('Docker build failed. ' + e.message);
        process.exit(1);
      }
    }
  });

  gulp.task('nova-call-deploy', function() {
    swig.log.info('Calling nova...');
    swig.log();
    execSync('nova deploy ' + argConfig.env + ' '  + argConfig.stack + ' ' + deployVersion, execSyncOpts.pipeOutput);
  });

  gulp.task('nova-deploy', function(done) {
    if (argv.h || argv.help) {    // --help
      outputHelp();
    }

    swig.seq(
      'nova-check-options',
      'nova-check-aws-auth',
      'pull-latest-tags',
      'nova-new-version',
      'nova-specified-version',
      'assets-deploy',
      'nova-version-cleanup',
      'nova-build-docker',
      'nova-call-deploy',
      done);
  });
};