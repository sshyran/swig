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

// handles merging module packages
module.exports = function (gulp, swig) {

  var options,
    packagePath,
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    target;

  return {
    extract: function (pkg, deps, origin) {
      deps = deps || {};

      function push (name, version) {
        if (!deps[name]) {
          deps[name] = [];
        }
        deps[name].push({ version: version, origin: origin });
      }

      _.each(pkg.uiDependencies || pkg.dependencies, function (value, key) {
        push(key, value);
      });

      if (pkg.lazyDependencies) {
        _.each(pkg.lazyDependencies, function (value, key) {
          push(key, value);
        });
      }

      return deps;
    },

    iterate: function (depTree) {
      var results = {},
        conflictFound = false;

      swig.log('Checking for dependency conflicts');
      swig.log('\nModule List:');

      //console.log('depTree', depTree);

      _.each(depTree, function (versions, name) {
        var ver = _.reduce(_.pluck(versions, 'version'), function (memo, version) {
          var comparer;

          // Are the 2 versions are identical?
          if (!memo || version === memo) {
            return version;
          }

          // Are they both explicit versions? (and not identical)
          if (memo.match(/\d+\.\d+\.\d+\w*/) && version.match(/\d+\.\d+\.\d+\w*/)) {
            return null;
          }

          // Check to see if one version has any wildcards that match the other version
          comparer = memo + ' ?= ' + version;

          if (comparer.match(/(\d+\.\d+)\.x \?= \1\.\d+\w*/) ||
              comparer.match(/(\d+)\.x\.x \?= \1\.\d+\.(\d+|x)\w*/) ||
              comparer.match(/(?:x\.x\.x|\*) \?= (\d+|x)\.(\d+|x)\.(\d+|x)\w*/)) {
            return version;
          }

          // Reverse, and recheck
          comparer = version + ' ?= ' + memo;

          if (comparer.match(/(\d+\.\d+)\.x \?= \1\.\d+\w*/) ||
              comparer.match(/(\d+)\.x\.x \?= \1\.\d+\.(\d+|x)\w*/) ||
              comparer.match(/(?:x\.x\.x|\*) \?= (\d+|x)\.(\d+|x)\.(\d+|x)\w*/)) {
            return memo;
          }

          return null;

        }, null);

        if (!ver) {
          swig.log(name.red);
          swig.log(('Please resolve multiple versions of ' + name + ':').red, 3);

          _.each(versions, function (version) {
            swig.log((version.version + ' (in ' + version.origin + ')').red, 4);
          });

          conflictFound = true;
        }
        else {
          swig.log(name + ' : ' + ver);
          results[name] = ver;
        }

      });

      if (conflictFound) {
        swig.log('Package Merge: module version conflict found (scroll up if you can\'t see the conflict).');
      }

      return results;
    },

    generate: function (deps, key) {
      var packageTempPath = path.join(swig.temp, (key ? key + '-' : '') + 'package.json'),
        pkg = { dependencies: deps },
        internalModules = {
          'internal.browser_detect' : '0.1.x',
          'internal.json' : '2.0.x',
          'internal.less' : '1.6.x',
          'internal.modernizr' : '2.5.x',
          'internal.require' : '2.1.x',
          'internal.require_wrapper' : '0.1.x',
          'less.helpers' : '0.2.x'
        };

      if (fs.existsSync(packageTempPath)) {
        fs.unlinkSync(packageTempPath); // posix name for 'delete'
      }

      // extend the dependencies with the internal module requirements (require, require_wrapper, etc.)
      pkg.dependencies = _.extend(pkg.dependencies, internalModules);

      fs.writeFileSync(packageTempPath, JSON.stringify(pkg, null, 2));

      swig.log('Writing merged package.json: ' + packageTempPath.grey);
    }
  };

};