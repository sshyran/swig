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
    tasks = [],
    flags = [
      [ '--poolparty', 'Display verbose output from swig,\nand do not suppress Gulp output.' ],
      [ '--pretty', 'Set to false if colors and unicode symbols should be stripped in swig output.'],
      [ '--verbose', 'Display verbose output from swig' ]
    ];

  // we don't want to tell swig about the default task
  // because that's kind of pointless

  gulp.task('default', function () {

    _.each(swig.tasks, function (taskInfo, taskName) {
      var taskFlags = [];

      if (taskInfo.flags && Object.keys(taskInfo.flags).length > 0) {
        _.each(taskInfo.flags, function (flagDesc, flagName) {
          taskFlags.push(flagName.bold + ' : ' + flagDesc);
        });

        if (taskFlags.length) {
          taskFlags.unshift('');
          taskFlags.push('');
        }
      }

      tasks.push([
        swig.log.padLeft(taskName, 2),
        taskInfo.description + taskFlags.join('\n')
      ]);
    });

    tasks = _.sortBy(tasks, function (task) {
      return task[0];
    });

    // indent the flags table
    flags.forEach(function (flag) {
      flag[0] = swig.log.padLeft(flag[0], 2);
    });

    swig.log.task('Primary Swig Tasks');
    swig.log();
    swig.log.table(tasks);

    swig.log();
    swig.log.task('Swig Global Flags');
    swig.log();
    swig.log.table(flags);
  });
};
