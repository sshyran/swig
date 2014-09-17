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

module.exports = function (swig) {

  /*
  *  copied from https://raw.githubusercontent.com/visionmedia/co-exec/master/index.js
  *  since they don't support returning stderr just yet.
  */

  var exec = require('child_process').exec;

  // return a thunk for yield/generator functionality
  swig.exec = function swigExec (cmd, opts) {
    return function swigExecThunk (done){
      exec(cmd, opts, function execCb (err, stdout, stderr){
        done(err, { stdout: stdout, stderr: stderr });
      });
    };
  };
};