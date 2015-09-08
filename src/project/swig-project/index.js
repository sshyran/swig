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

module.exports = function (gulp) {

  // this sets the --harmony and --harmony-proxies flags on the node process
  // this allows us to use `gulp` or `node` on swig tasks without specifying
  // those flags (it's a good thing)
  require('harmonize')();

  var _ = require('underscore'),
    path = require('path'),
    os = require('os'),
    fs = require('fs'),
    argv = require('yargs').argv,
    target,
    taskName = argv._.length > 0 ? argv._[0] : 'default',
    thisPkg = require('./package.json'),
    swig = {
      pkg: {},
      gulp: gulp,
      argv: argv,
      project: {},
      env: process.env.GILT_ENV || 'development'
    };

  require('colors');
  console.log('·  ' + 'swig-project'.red + ' v' + thisPkg.version + '\n·');

  function load (moduleName) {

    if (argv.verbose) {
      console.log('Loading: ' + moduleName);
    }

    var module = require(moduleName)(gulp, swig) || {};

    module.path = path.dirname(require.resolve(moduleName));
    module.pkg = require(path.join(module.path, '/package.json'));

    try {
      module.swigInfo = require(path.join(module.path, '/swig.json'));
    }
    catch (e) {
      if (e.code != 'MODULE_NOT_FOUND') {
        throw e;
      }
    }

    return module;
  }

  function setupPaths () {
    var fs = require('fs'),
      path = require('path'),
      swigPath = path.join(process.env.HOME, '.swig');

    if (!fs.existsSync(swigPath)) {
      fs.mkdirSync(swigPath);
    }

    swig.home = swigPath;
    swig.cwd = process.cwd();
    swig.temp = path.join(os.tmpdir(), 'swig');
  }

  function findSwigRc() {
    var rcPath = path.join(process.env.HOME, '/.swigrc');

    if (!fs.existsSync(rcPath)) {
      swig.log.error('swig-project', '.swigrc not found at: ' + '~/.swigrc'.grey + '. Please grab a copy from ' + '/web/tools/config/user.\n'.grey);
      swig.log('   .swigrc is required because it contains internal information that swig needs.');
      process.exit(1);
    }
    else {
      swig.rc = JSON.parse(fs.readFileSync(rcPath));
    }
  }

  function findTarget () {

    var target,
      moduleName,
      repo = swig.argv.repo || '';

    if(swig.argv.module) {
      target = path.join('src', swig.argv.module.replace(/\./g, '/'));

      if (repo) {
        target = path.join('/web/', repo, target);
      }
      else {
        target = path.join(swig.cwd, target);
      }

      swig.project.type = 'module';
    }
    else {
      target = repo ? path.join('/web/', repo) : swig.cwd;

      swig.project.type = 'webapp';
    }

    swig.target = {
      path: target,
      name: path.basename(target),
      repo: swig.argv.repo || path.basename(swig.cwd)
    };
  }

  function findPackage () {

    var packagePath = path.join(swig.target.path, 'package.json')

    if (fs.existsSync(packagePath)) {
      swig.pkg = require(packagePath);
    }
    else {
      console.log('.  ' + 'warning!    '.yellow.bold + ' package.json not found at: ' + packagePath.grey);
    }
  }

  swig.util = require('@gilt-tech/swig-util')(swig, gulp);

  setupPaths();
  findTarget();
  findPackage();
  findSwigRc();

  target = (swig.argv.module || swig.pkg.name);

  console.log('·  ' + 'gulpfile:    '.blue + module.parent.id.replace(process.env.HOME, '~').grey);
  console.log('·  ' + 'target:      '.blue + (target ? (target || '').grey : 'NO TARGET'.yellow.bold));
  console.log('·  ' + 'target-path: '.blue + swig.target.path.grey + '\n');

  // create swigs's temporary directory;
  if (!fs.existsSync(swig.temp)) {
    fs.mkdirSync(swig.temp);
  }

  // tools are still gulp tasks, but they don't tend to operate on files
  // in this context the distinction is important so that we don't do any
  // extra processing
  swig = _.extend(swig, {
    tools: {
      'app-registry': load('@gilt-tech/swig-app-registry'),
      'relase-email': load('@gilt-tech/swig-release-email'),
      run: load('@gilt-tech/swig-run'),
      stub: load('@gilt-tech/swig-stub'),
      zk: load('@gilt-tech/swig-zk')
    }
  });

  // if the requested task is a tool, stop loading things.
  if (_.has(swig.tools, taskName)) {
    return swig;
  }

  swig = _.extend(swig, {
    tasks: {
      'assets-deploy': load('@gilt-tech/swig-assets'),
      bundle: load('@gilt-tech/swig-bundle'),
      'default': load('@gilt-tech/swig-default'),
      'deps': load('@gilt-tech/swig-deps'),
      'docker-release': load('@gilt-tech/swig-docker'),
      install: load('@gilt-tech/swig-install'),
      lint: load('@gilt-tech/swig-lint'),
      'merge-css': load('@gilt-tech/swig-merge-css'),
      minify: load('@gilt-tech/swig-minify'),
      publish: load('@gilt-tech/swig-publish'),
      spec: load('@gilt-tech/swig-spec')
    }
  });

  return swig;
};
