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
    commands = [];

  gulp.task('default', function () {

    _.each(_.extend(swig.tasks, swig.tools), function (module, name) {
      commands.push({ name: name, module: module });
    });

    commands = _.sortBy(commands, function (command) {
      return command.name;
    });

    var tasks = [];

    _.each(commands, function (command) {
      tasks.push(swig.log.padding + command.name);
    });

    swig.log.task('Available Swig Tasks');
    swig.log(tasks.join('\n') + '\n');
  });
};