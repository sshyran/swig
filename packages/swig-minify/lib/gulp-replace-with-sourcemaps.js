

// modified from https://github.com/lazd/gulp-replace/blob/master/index.js

// NOTE: Few things to keep in mind
//  - It supports only Buffer transformations (Stream coming in future, maybe)
//  - It only works with unminified code (or if it is the first transformation
//    in the pipe; requires a bit of investigation)

const Transform = require('readable-stream/transform');
const istextorbinary = require('istextorbinary');
const Replacer = require('./regex-replacer.js');
const applySourceMap = require('vinyl-sourcemaps-apply');
const path = require('path');

module.exports = function (searchRE, replacement, options) {
  return new Transform({
    objectMode: true,
    transform(file, enc, callback) {
      if (file.isNull()) {
        callback(null, file);
        return;
      }

      function doReplace() {
        const replacer = new Replacer(searchRE, replacement);

        if (file.isStream()) {
          console.warn('gulp-replace-asset-url: Stream transformation not supported, yet.');

          callback(null, file);
          return;
        }

        if (file.isBuffer()) {
          const result = replacer.replace(String(file.contents),
              path.basename(file.path));
          file.contents = new Buffer(result.code);

          if (file.sourceMap) {
            applySourceMap(file, result.map);
          }

          callback(null, file);
          return;
        }

        callback(null, file);
      }

      if (options && options.skipBinary) {
        istextorbinary.isText(file.path, file.contents, (err, result) => {
          if (err) {
            callback(err, file);
            return;
          }

          if (!result) {
            callback(null, file);
          } else {
            doReplace();
          }
        });

        return;
      }

      doReplace();
    }
  });
};
