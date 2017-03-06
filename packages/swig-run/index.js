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
const path = require('path');
const spawn = require('child_process').spawn;
const fs = require('fs');
const _ = require('underscore');
const forever = require('forever');
const bs = require('browser-sync');

module.exports = function (gulp, swig) {
  swig.tell('run', {
    description: 'Swig tasks for running Gilt Node Framework apps.',
    flags: {
      '--forever': 'Runs the app using `forever` and tails the forever log.'
    }
  });

  // Loading swig dependencies
  swig.loadPlugins(require('./package.json').dependencies);

  const node = {
    command: path.join(__dirname, '/lib/command-node'),
    forever: path.join(__dirname, '/lib/command-forever'),
    args: [],
    env: {},
    valid: function () {
      const pkg = swig.pkg;
      const errors = [];

      if (!pkg) {
        errors.push('  package.json not found!');
      } else {
        if (!pkg.name) {
          errors.push('  package.json Name missing!');
        }

        if (!pkg.version) {
          errors.push('  package.json Version missing!');
        }

        if (!pkg.description) {
          errors.push('  package.json Description missing!');
        }
      }

      return errors;
    },
    exists: function () {
      swig.log.task('Looking for app.js');
      return fs.existsSync(path.join(process.cwd(), 'app.js'));
    }
  };

  function run(cb) {
    const env = _.extend(process.env, node.env || {});
    const cmd = swig.argv.forever ? node.forever : node.command;
    const cp = spawn(cmd, node.args, env);

    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stderr);

    cp.on('error', (err) => {
      swig.log.error('swig-app', 'Error:');
      swig.log(err);
    });

    cp.on('exit', () => {
      cb();
    });

    // handles CTL+C so that only the node.js instance is exited and not gulp.
    process.on('SIGINT', () => {
      cp.kill();
      swig.log();
      swig.log.success(null, 'Terminating App');

      const runner = forever.stop('app.js', false);

      runner.on('stop', () => {
        swig.log.success(null, 'Stopped forever Daemon');
      });

      runner.on('error', () => {
        swig.log.error('forever', 'Error stopping the forever Daemon');
        process.exit(1);
      });
    });
  }

  gulp.task('watch', () => {
    if (!swig.watch.enabled) return null;

    const port = (isNaN(parseInt(swig.argv.watch, 10))) ? 8080 : swig.argv.watch;
    process.env.GILT_LOG_LEVEL = 'WARN';

    // Init BrowserSync
    swig.watch.browserSync = bs.create(swig.target.name);
    swig.watch.browserSync.init({
      // browser sync will act as a proxy, forwarding every request towards localhost.com
      proxy: 'localhost.com',
      port,
      online: false,
      open: false,
      logLevel: 'info',
      ghostMode: {
        clicks: false,
        forms: false,
        scroll: false
      }
    });

    swig.watch.watchers.forEach(watcher => gulp.watch(watcher.path, [watcher.task]));
  });

  gulp.task('run', swig.seq(['init-scripts', 'init-styles'], 'watch'), (cb) => {
    let errors;

    swig.log();
    if (node.exists()) {
      swig.log.task('Checking validity of the app');
      errors = node.valid();

      if (!errors.length) {
        if (swig.argv.debug) {
          node.args.push('--debug');
        }

        swig.log.task('Running app');
        swig.log();
        run(cb);
      } else {
        swig.log.error('swig-app', `Couldn't start your app due to the following:\n${errors.join('\n')}`);
      }
    } else {
      swig.log.error('swig-app', 'No node.js apps found in this directory.');
    }
  });
};
