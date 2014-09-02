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
    sh = require('co-sh'),
    read = require('co-read'),
    zkDir = '/web/zookeeper',
    zkPid = path.join(zkDir, '/var/zookeeper_server.pid'),
    zkSh = path.join(zkDir, '/bin/zkServer.sh');

  function check (command) {

    if (!fs.existsSync(zkDir)) {
      var message = 'Zookeeper doesn\'nt exist at ' + zkDir + '! Please clone it and try again.';
      swig.log(message);
      return false;
    }

    if (fs.existsSync(zkPid)) {
      if (command === 'start') {
        swig.log('Zookeeper is already running.')
        return false;
      }
    }
    else {
      if (command === 'stop') {
        swig.log('Zookeeper isn\'t running.')
        return false;
      }
    }

    return true;
  }

  gulp.task('zk', co(function *() {

    var command = swig.argv.stop ? 'stop' : 'start',
      buffer;

    swig.log('Zookeeper: Attempting ' + command.toUpperCase());

    if (!check(command)){
      return;
    }

    var proc = yield sh[zkSh + ' ' + command]();

    while (buffer = yield read(proc.stdout)) {
      console.log(buffer.toString());
    }
  }));

};
