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
    fs = require('fs'),
    path = require('path'),
    through = require('through2');

  return function plugin () {

    var regex = /\$\$PACKAGE_VERSION\$\$/,
      success = true,
      content,
      data;

    return through.obj(function (file, enc, cb) {

      if (file.isBuffer()) {
        content = file.contents.toString();
        if (content.indexOf('createModule') > -1) {
          if (!regex.test(content)) {
            success = false;
            swig.log.warn(null, file.path);
          }
          else {
            swig.log.success(null, file.path);
          }
        }
      }

      cb();
    }, function (cb) {
      if (!success) {
        swig.log();
        swig.log.warn(null, 'Please make sure you\'re retuning an object containing ' + '"version: \'$$PACKAGE_VERSION$$\'"'.yellow);
      }
      cb();
    });

  };
};
