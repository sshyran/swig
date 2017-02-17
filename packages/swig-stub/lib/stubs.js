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

module.exports = function stubsPlugin(swig, data) {
  const path = require('path');
  const through = require('through2');
  const gutil = require('gulp-util');
  const mustache = require('mustache');

  return through.obj((file, enc, cb) => {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('swig-stub:stubs', 'Streaming not supported'));
      return;
    }

    const extension = path.extname(file.path).toLowerCase();

    if (extension === '.mustache') {
      file.contents = new Buffer(mustache.render(file.contents.toString(), data));
      file.path = file.path.replace('.mustache', '');
    }

    cb(null, file);
  });
};
