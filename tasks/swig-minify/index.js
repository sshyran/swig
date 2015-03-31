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
    co = require('co'),
    exec = require('co-exec'),
    path = require('path'),
    globby = require('globby'),
    fs = require('fs');

  gulp.task('minify', function (done) {

    // js - uglify --output
    // css - clean-css -o
    // less - lessc -x
    // handlebars - handlebars -s -r

    // UICommons::Environment.env(args[:environment])

    // #noinspection RubySimplifyBooleanInspection
    // quit UICommons::EXIT_CODES::TASK_FAILED if false == UICommons::Results.continuous(:title => 'Minified', :pass_action => 'minified') do |result|
    //   UICommons::Language.minify(result, package_folders, false)
    // end

    done();
  });

};
