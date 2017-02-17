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
  const fs = require('fs-extra');
  const path = require('path');

  swig.fs = {
    _fs: fs,
    findup: require('findup-sync'),

    // https://raw.githubusercontent.com/substack/node-mkdirp/master/index.js
    mkdir: function (p, mode, made) {
      if (mode === undefined) {
        mode = 0o777 & (~process.umask());
      }
      if (!made) made = null;

      if (typeof mode === 'string') mode = parseInt(mode, 8);
      p = path.resolve(p);

      try {
        fs.mkdirSync(p, mode);
        made = made || p;
      } catch (err0) {
        switch (err0.code) {
          case 'ENOENT' :
            made = swig.fs.mkdir(path.dirname(p), mode, made);
            swig.fs.mkdir(p, mode, made);
            break;
          default: {
            let stat;
            try {
              stat = fs.statSync(p);
            } catch (err1) {
              throw err0;
            }
            if (!stat.isDirectory()) throw err0;
            break;
          }
        }
      }

      return made;
    },

    copyAll: function (src, dest) {
      const exists = fs.existsSync(src);
      const stats = exists && fs.statSync(src);
      const isDirectory = exists && stats.isDirectory();

      if (exists && isDirectory) {
        swig.fs.mkdir(dest);
        fs.readdirSync(src).forEach((childItemName) => {
          swig.fs.copyAll(path.join(src, childItemName),
            path.join(dest, childItemName));
        });
      } else {
        fs.copySync(src, dest);
      }
    }
  };
};
