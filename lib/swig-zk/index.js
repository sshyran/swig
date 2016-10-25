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
    path = require('path'),
    fs = require('fs'),
    thunkify = require('thunkify'),
    co = require('co'),
    run = require('co-run'),
    read = require('co-read'),
    zkDir = '/web/zookeeper',
    zkPid = path.join(zkDir, '/var/zookeeper_server.pid'),
    zkSh = path.join(zkDir, '/bin/zkServer.sh');

  swig.tell('zk', { description: 'A swig task that ensures zookeeper is running.' });

  function check (command) {

    if (!fs.existsSync(zkDir)) {
      var message = 'Zookeeper doesn\'nt exist at ' + zkDir + '! Please clone it and try again.';
      swig.log.error(null, message);
      return false;
    }

    if (fs.existsSync(zkPid)) {
      if (command === 'start') {
        swig.log(swig.log.padding + ' Zookeeper is already running.'.grey)
        return false;
      }
    }
    else {
      if (command === 'stop') {
        swig.log(swig.log.padding + ' Zookeeper isn\'t running.'.grey)
        return false;
      }
    }

    return true;
  }

  gulp.task('zk', co(function *() {

    var command = swig.argv.stop ? 'stop' : 'start',
      buffer;

    swig.log.task('Zookeeper - Attempting ' + command.toUpperCase());

    if (!check(command)){
      return;
    }

    var proc = yield run(zkSh + ' ' + command);

    while (buffer = yield read(proc.stdout)) {
      swig.log(swig.log.padding + ' ' + buffer.toString().grey);
    }
  }));

};
