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

module.exports = function (swig, gulp) {
  require('./lib/email')(swig);
  require('./lib/error')(swig);
  require('./lib/exec')(swig);
  require('./lib/fs')(swig);
  require('./lib/diff')(swig);
  require('./lib/srcPath')(swig);

  swig.log = require('./lib/log')(swig);

  // a utility to allow us to run tasks in a series, non-paralell order.
  // we're loading this local, modded copy until the author merges a PR
  // chalk is a dep in package.json required for this. remove that
  // when we go back to using the npm module (if).
  swig.seq = require('run-sequence').use(gulp);
};
