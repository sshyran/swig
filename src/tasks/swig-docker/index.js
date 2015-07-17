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

  Order of Operations:
  docker-setup
  docker-copy
  docker-build
  docker-publish
  docker-release
*/

module.exports = function (gulp, swig) {

  var _ = require('underscore'),
    fs = require('fs-extra'),
    path = require('path'),
    os = require('os'),
    which = require('which'),
    co = require('co'),
    mustache = require('mustache'),
    rimraf = require('rimraf'),
    copy = require('wrench').copyDirSyncRecursive,

    version = swig.pkg.version,
    appName = swig.pkg.name,
    tempDir = path.join(os.tmpdir(), 'docker-' + appName),
    homeDir = process.env['HOME'],
    port = swig.pkg.gilt.port,
    imageName = swig.pkg.gilt.dockerOrg + '/' + appName + ':' + version,

    // boot2docker is default
    dockerConfigPath = path.join(homeDir, '/.dockercfg'),

    envars = {
      DOCKER_CERT_PATH: path.join(homeDir, '/.boot2docker/certs/boot2docker-vm'),
      DOCKER_TLS_VERIFY: '1',
      DOCKER_HOST: 'tcp://192.168.59.103:2376'
    },

    execOptions = {
      stdout: function (data) {
        if (swig.argv.verbose) {
          swig.log.write('  ' + data);
        }
      },
      stderr: function (data) {
        if (swig.argv.verbose) {
          swig.log.write('  ' + data);
        }
      }
    };

  gulp.task('docker-setup', co(function *() {

    var ionroller = swig.rc.build.ionroller,

      // remove this from config once it's public
      ionrollerInstall = swig.rc.build.ionrollerInstall,
      boot2docker = true,
      kitematic = true,
      authenticated = false,
      kitematicConfigPath = path.join(homeDir, '/.docker/config.json'),
      output,
      config;

    if (!swig.pkg.gilt.dockerOrg) {
      swig.log.warn('', 'gilt.dockerOrg is not defined in package.json. Defaulting to "giltcommon"');
      swig.pkg.gilt.dockerOrg = 'giltcommon';
    }

    swig.log.info('dockerOrg in package.json set to: ', swig.pkg.gilt.dockerOrg);
    swig.log();

    // check for boot2docker - `which boot2docker`
    // docker wont run on mac without boot2docker or kitematic
    try {
      swig.log.task('Checking for boot2docker');
      which.sync('boot2docker');

      output = yield swig.exec('boot2docker up;');
    }
    catch (e) {
      boot2docker = false;
      swig.log.warn('', 'boot2docker wasn\'t found.')
    }

    if (!boot2docker) {
      // check for kitematic - `which docker-machine`
      // docker wont run on mac without this
      try {
        swig.log.task('Checking for kitematic (docker-machine)');
        which.sync('docker-machine');

        output = yield swig.exec('docker-machine start dev;');

        envars.DOCKER_CERT_PATH = path.join(homeDir, '/.docker/machine/machines/dev');
        envars.DOCKER_HOST = 'tcp://192.168.99.100:2376';

        if (fs.existsSync(kitematicConfigPath)) {
          dockerConfigPath = kitematicConfigPath;
        }
        else {
          if (!fs.existsSync(dockerConfigPath)) {
            swig.log();
            swig.log.error('Couldn\'t locate the config file for boot2docker or kitematic.');
            swig.log.info('', 'We looked in these locations:');
            swig.log.info('', dockerConfigPath);
            swig.log.info('', kitematicConfigPath);
            process.exit(1);
          }
        }
      }
      catch (e) {
        kitematic = false;
        swig.log.warn('', 'kitematic wasn\'t found.')
      }
    }

    if (!boot2docker && !kitematic) {
      swig.log();
      swig.log.error('Neither boot2docker nor kitematic were found', 'One of the two are required by this task!');
      swig.log.info('', 'Please install either before proceding:')
      swig.log.info('boot2docker', 'https://docs.docker.com/installation/mac/');
      swig.log.info('kitematic', 'https://kitematic.com/');
      process.exit(1);
    }

    swig.log.task('Checking for docker login');

    // Check that docker is logged in
    if (fs.existsSync(dockerConfigPath)) {

      try {
        config = fs.readFileSync(dockerConfigPath, 'utf8');
        config = JSON.parse(config);
      }
      catch (e) {
        swig.log.error('Error reading and/or parsing JSON file: ' + dockerConfigPath);
        config = {};
      }

      // kitematic stores config in ~/.docker/config.json
      // {
      //   "auths": {
      //     "https://index.docker.io/v1/": {
      //       "auth": "<token>",
      //       "email": "<email>"
      //     }
      //   }
      // }
      if (kitematic && _.keys(config).length > 0 && config.auths) {
        _.each(config.auths, function (pair, key) {
          if (pair.auth && pair.email) {
            authenticated = true;
          }
        });
      }

      // boot2docker and old versions < 0.3.0 of kitematic stores config in ~/.dockercfg
      // {
      //   "https://index.docker.io/v1/":{
      //     "auth":"<token>",
      //     "email":"<email>"
      //   }
      // }
      else if (_.keys(config).length > 0) {
        _.each(config, function (pair, key) {
          if (pair.auth && pair.email) {
            authenticated = true;
          }
        });
      }
    }
    else {
      authenticated = false;
    }

    if (!authenticated) {
      swig.log();
      swig.log.error('You must be logged into docker to continue.');
      swig.log.info('', 'Most of the docker tasks require you to be logged in.')
      swig.log.info('', 'You can login by running `docker login`. Then try this task again.')
      process.exit(1);
    }

    // check for ionroller
    try {
      swig.log.task('Checking for Ionroller');
      which.sync('ionroller');
    }
    catch (e) {
      swig.log();
      swig.log.error('Ionroller wasn\'t found, and is required!')

      // TODO - use inquisitor
      var answer = yield swig.log.prompt(swig.log.padLeft('Shall I install it for you? (y/n)', 1));

      if (!answer || (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes')) {
        swig.log();
        swig.log('(╯°□°）╯︵ ┻━┻)  Allllrighty then.');
        process.exit(1);
      }
      else {
        swig.log();
        swig.log.task('Installing Ionroller');
        swig.log();

        try {
          var result = yield swig.exec('curl -s ' + ionrollerInstall + ' | sh', null, {
            stdout: function (data) {
              swig.log.write(data.toString());
            },
            stderr: function (data) {
              swig.log.write(data.toString().red);
            }
          });
        }
        catch (e) {
          swig.log.error('Ionroller Install Failed', 'Ionroller is required to proceed.');
          process.exit(1);
        }

      }

    }

  }));

  gulp.task('docker-copy', ['docker-setup'], function (done) {

    // we're copying everything to a temp dir so we can operate on it
    // safely. we don't want to rely on .dockerignore being present.
    // we don't need node_modules in the temp directory, so kill it.
    // this saves time on the image build.

    swig.log('');
    swig.log.task('Cleaning Temporary Directory');
    swig.log.info('', '→ ' + tempDir.grey);

    rimraf.sync(tempDir);
    fs.mkdirpSync(tempDir);

    swig.log.task('Copying Files to');
    swig.log.info('', '→ ' + tempDir.grey);
    swig.log.info('(this may take a minute)');

    var exclude = [
      '.dockerignore',
      '.git',
      '.gitignore',
      'ionroller-setup.json',
      'Makefile',
      'newrelic_agent.log',
      'node_modules',
      'README.md',
      'docker-to-swig.js'
    ];

    // gulp+vinyl has a nasty bug with symlinks, and we're creating
    // a few in the node framework.
    // return gulp.src(path.join(swig.target.path, '/**/*'));

    copy(swig.target.path, tempDir, {
      forceDelete: true,
      excludeHiddenUnix: true,
      preserveFiles: false,
      inflateSymlinks: true,
      exclude: function (filename, dir) {
        return _.contains(exclude, filename);
      }
    });

    swig.log.task('Copying Resource Files to');
    swig.log.info('', '→ ' + tempDir.grey);

    fs.copySync(path.join(homeDir, '.npmrc'), path.join(tempDir, '.npmrc'));
    fs.copySync(path.join(homeDir, '.swigrc'), path.join(tempDir, '.swigrc'));

    done();
  });

  gulp.task('docker-build', ['docker-copy'], co(function *() {

    var dockerFilePath = path.join(swig.target.path, 'Dockerfile'),
      dockerFile = fs.readFileSync(dockerFilePath, 'utf8'),
      command,
      output;

    // automate the process of setting the EXPOSE port in the docker file
    dockerFile = mustache.render(dockerFile, { DOCKER_PORT: port });
    fs.writeFileSync(path.join(tempDir, 'Dockerfile'), dockerFile, 'utf-8');

    swig.log('');
    swig.log.task('Building Docker Image for Version: ' + version);
    swig.log.info('(this may take a minute, use --verbose to view output)');

    command = 'docker build -t "' + imageName + '" ' + tempDir;
    output = yield swig.exec(command, { cwd: tempDir, env: _.extend(process.env, envars) }, execOptions);

    rimraf.sync(tempDir);
  }));

  gulp.task('docker-publish', ['docker-build'], co(function *() {

    swig.log('');
    swig.log.task('Publishing Docker Image');
    swig.log.info('', '(use --verbose to view output}');
    swig.log.info('', imageName + ' → ' + swig.rc.build.dockerhub.grey);

    var output = yield swig.exec('docker push ' + imageName, { env: _.extend(process.env, envars) }, execOptions);

    swig.log('');
  }));

  gulp.task('docker-release', ['docker-publish'], co(function *() {

    swig.log('');
    swig.log.task('Releasing via Ionroller');
    swig.log.info('', '(use --verbose to view output}');

    var output = yield swig.exec('ionroller release ' + appName + ' ' + version, null, execOptions);
  }));

  gulp.task('docker', ['docker-release'], function (done) {
    done();
  });

}