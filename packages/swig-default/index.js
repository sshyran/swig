

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
  const _ = require('underscore');
  let tasks = [];
  const flags = [
    ['--poolparty', 'Display verbose output from swig,\nand do not suppress Gulp output.'],
    ['--pretty', 'Set to false if colors and unicode symbols should be stripped in swig output.'],
    ['--verbose', 'Display verbose output from swig']
  ];

  // we don't want to tell swig about the default task
  // because that's kind of pointless

  gulp.task('default', () => {
    _.each(swig.tasks, (taskInfo, taskName) => {
      const taskFlags = [];
      let desc = taskInfo.description;

      if (taskInfo.flags && Object.keys(taskInfo.flags).length > 0) {
        _.each(taskInfo.flags, (flagDesc, flagName) => {
          taskFlags.push(flagName);
        });

        desc = `${desc}\nFlags: ${taskFlags.join(', ')}\n`;
      }

      tasks.push([
        swig.log.padLeft(taskName, 2),
        desc
      ]);
    });

    tasks = _.sortBy(tasks, task => task[0]);

    // indent the flags table
    flags.forEach((flag) => {
      flag[0] = swig.log.padLeft(flag[0], 2);
    });

    swig.log.task('Primary Swig Tasks');
    swig.log();
    swig.log.table(tasks);
    swig.log('\nRun `swig help <task>` for more information.');

    swig.log();
    swig.log.task('Swig Global Flags');
    swig.log();
    swig.log.table(flags);
  });

  gulp.task('help', () => {
    const task = swig.tasks[swig.argv.task];
    const taskFlags = [];

    if (!task) {
      swig.log.error('help', `The task: ${task.magenta} has no associated help information.`);
      process.exit(1);
    }

    swig.log.task(`Displaying information for ${swig.argv.task.white.bold}`);
    swig.log();

    swig.log(task.description);
    swig.log();

    if (task.flags && Object.keys(task.flags).length > 0) {
      swig.log.task(`${swig.argv.task} Flags`);
      swig.log();

      _.each(task.flags, (flagDesc, flagName) => {
        taskFlags.push([flagName, flagDesc]);
      });

      // indent the flags table
      taskFlags.forEach((flag) => {
        flag[0] = swig.log.padLeft(flag[0], 2);
      });

      swig.log.table(taskFlags);
    }
  });
};
