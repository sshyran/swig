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
  const inquirer = require('inquirer');

  var _ = require('underscore'),
    argv = require('yargs').argv,
    AWS = require('aws-sdk'),
    execSync = require('child_process').execSync,
    co = require('co'),
    fs = require('fs'),
    semverDiff = require('semver-diff'),
    YAML = require('yamljs'),
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

    argConfig = {
      env: null,
      stack: null,
      newVersion: null,
      version: null,
      forcedRun: false
    };

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
    console.log('  --force, -f      Skip confirmation phases (useful for CI environments)');
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


    // First thing, let's check if we have the right tools installed

    try {
      execSync('which nova');
    } catch(e) {
      swig.log.error('\'nova\' deploy tool does not appear to be installed. https://github.com/gilt/nova');
      process.exit(1);
    }

    // Then check if all the required files exist

    checkFilesExist.forEach(function(file) {
      if (!fs.existsSync(file)) {
        swig.log.error('Required file ' + file + ' not found.');
        fileNotFound = true;
      }
    });

    if (fileNotFound) {
      process.exit(1);
    }

   // Check if the git repo is not 'dirty'

    gitDiffResult = execSync('git diff --shortstat 2> /dev/null | tail -n1', execSyncOpts.returnOutput);
    if (gitDiffResult !== '') {
      swig.log.error('Git repo is dirty, please commit all changes and try again');
      process.exit(1);
    }

    // Check arguments validity

    if (argv.latestTag) {
      swig.log.info('Latest version tag is: ' + getLatestVersionTag());
      process.exit(0);
    }

    if (argv.env) {
      novaEnv = novayml.environments.find(
          e => e.name.toLowerCase() === argv.env.toLowerCase());
      if (!novaEnv) {
        swig.log.error(`Environment '${argv.env}' not found in your nova.yml.`);
        swig.log.info('Maybe a typo. Do not worry, we will ask you which ' +
            'environment you want to deploy to later.');
      } else {
        argConfig.env = novaEnv.name;
      }
    }

    if (argv.stack) {
      if (!novayml.environments.find(e => e.stacks.find(
            s => s.stack_name.toLowerCase() === argv.stack.toLowerCase()))) {
        swig.log.error(`Stack '${argv.stack}' not found in your nova.yml.`);
        swig.log.info('Maybe a typo. Do not worry, we will ask you which ' +
            'stack you want to deploy later.');
      } else {
        argConfig.stack = argv.stack;
      }
    }

    if (argv.version && argv.newVersion) {
      swig.log.error('--version and --new-version options can not be specified together.');
      outputHelp();
    }

    if (argv.newVersion) {
      if (!/^(?:patch|minor|major)$/.test(argv.newVersion)) {
        swig.log.error('Invalid value specified for --new-version option.');
        outputHelp(); // exits
      }
      argConfig.newVersion = argv.newVersion;
    }

    if (argv.version) {
      if (!/^\d+\.\d+\.\d+$/.test(argv.version)) {
        swig.log.error('Invalid value specified for --version option.');
        outputHelp(); // exits
      }
      argConfig.version = argv.version;
    }

    if (argv.force || argv.f) {
      argConfig.forcedRun = true;
    }

    done();
  });

  gulp.task('nova-inquisitor', co(function* () {
    swig.log('');
    const prompt = inquirer.createPromptModule();
    const environments = novayml.environments.map(e => e.name);
    const v = getLatestVersionTag().replace('v', '').split('.').map(n => +n);

    let answer;
    let env;

    if (!argConfig.env) {
      if (environments.length > 1) {
        answer = yield prompt({
          type: 'list',
          name: 'env',
          message: 'Choose the AWS environment you need to deploy to:',
          choices: environments
        });
        env = answer.env;
      } else {
        if (!argConfig.forcedRun) {
          answer = yield prompt({
            type: 'confirm',
            name: 'envConfirmed',
            message: `You will deploy to the AWS '${environments[0]}' environment. Correct?`,
            default: true
          });
          if (!answer.envConfirmed) {
            swig.log.info('Aborted!'.red);
            process.exit(1);
          }
        }
        env = environments[0];
      }
      argConfig.env = env;
      novaEnv = novayml.environments.find(e => e.name === env);
    }

    const stacks = novaEnv.stacks.map(s => s.stack_name);
    let stack;

    if (argConfig.stack) {
      let stackConf = novaEnv.stacks.find(
          s => s.stack_name.toLowerCase() === argConfig.stack.toLowerCase());
      if (!stackConf) {
        swig.log.error(`Stack '${argConfig.stack}' for environment ${env} not found in your nova.yml.`);
      } else {
        argConfig.stack = stack = stackConf.stack_name;
      }
    }

    if (!argConfig.stack || !stack) {
      if (stacks.length > 1) {
        answer = yield prompt({
          type: 'list',
          name: 'stack',
          message: 'Choose the AWS stack you need to deploy to:',
          choices: stacks
        });
        stack = answer.stack;
      } else {
        if (!argConfig.forcedRun) {
          answer = yield prompt({
            type: 'confirm',
            name: 'stackConfirmed',
            message: `You will deploy to the AWS '${stacks[0]}' stack. Correct?`,
            default: true
          });
          if (!answer.stackConfirmed) {
            swig.log.info('Aborted!'.red);
            process.exit(1);
          }
        }
        stack = stacks[0];
      }
      argConfig.stack = stack;
    }

    if (!argConfig.version && !argConfig.newVersion) {
      const currentVersion = `(current: ${v.join('.')})`.grey;
      answer = yield prompt({
        type: 'list',
        name: 'version',
        message: 'What version bump do you want to perform? ' + currentVersion,
        choices: [
          { name: 'major ' + `(${v[0]+1}.0.0)`.grey,
            value: 'major', short: 'major' },
          { name: 'minor ' + `(${v[0]}.${v[1]+1}.0)`.grey,
            value: 'minor', short: 'minor' },
          { name: 'patch ' + `(${v[0]}.${v[1]}.${v[2]+1})`.grey,
            value: 'patch', short: 'patch' },
          { name: 'Manually type new version...', value: 'manual' }
        ]
      });

      if (answer.version === 'manual') {
        answer = yield prompt({
          type: 'input',
          name: 'version',
          message: `What will be the new version? ${currentVersion}`,
          validate: version => /^\d+\.\d+\.\d+$/.test(version)
        })
        argConfig.version = answer.version;
      } else {
        argConfig.newVersion = answer.version;
      }
    }

    swig.log('');
    swig.log.info('', 'Deploying with the following configuration:');
    swig.log.status('', ' Environment: '.cyan + `'${argConfig.env}'`.green);
    swig.log.status('', ' Stack: '.cyan + `'${argConfig.stack}'`.green);
    if (argConfig.version) {
      swig.log.status('', ' New Version: '.cyan + `${argConfig.version}`.green);
    } else {
      if (argConfig.newVersion === 'major') {
        swig.log.status('', ' New Version: '.cyan + `${v[0]+1}.0.0`.green);
      }
      if (argConfig.newVersion === 'minor') {
        swig.log.status('', ' New Version: '.cyan + `${v[0]}.${v[1]+1}.0`.green);
      }
      if (argConfig.newVersion === 'patch') {
        swig.log.status('', ' New Version: '.cyan + `${v[0]}.${v[1]}.${v[2]+1}`.green);
      }
    }

    if (!argConfig.forcedRun) {
      swig.log('');
      answer = yield prompt({
        type: 'confirm',
        name: 'confirmed',
        message: 'Are you sure you want to proceed?',
        default: true
      });
      if (!answer.confirmed) {
        swig.log.info('Aborted!'.red);
        process.exit(1);
      }
    }
  }));

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
    var imageAlreadyExists = execSync('docker images -q ' + novayml.service_name + ':' + deployVersion, execSyncOpts.returnOutput),
      homeNpmrcPath = process.env.HOME + '/.npmrc',
      localNpmrcPath = './.npmrc';

    if (imageAlreadyExists) {
      swig.log.warn('Docker image with tag [' + novayml.service_name + ':' + deployVersion + '] already exists, using this.');
    } else {
      try {
        //track if .npmrc file exists in the project folder, so as to know whether to clean it up after the docker container is built.
        var localNpmrc = false;

        if (fs.existsSync(localNpmrcPath)) {
          localNpmrc = true
        } else {
          fs.linkSync(homeNpmrcPath, localNpmrcPath);
        }
        execSync('docker build -t ' + novayml.service_name + ':' + deployVersion + ' .', _.extend({ stdio: 'pipe' }, execSyncOpts.pipeOutput));

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
      'nova-inquisitor',
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
