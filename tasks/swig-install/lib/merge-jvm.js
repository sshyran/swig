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

// handles merging module packages for jvm apps
module.exports = function (gulp, swig, util) {

  return function jvm () {
    var Zip = require('adm-zip'),
      glob = require('glob'),
      deps;

    swig.log('Merging JVM App Package(s):');

    deps = util.extract(swig.pkg, {}, path.basename(swig.cwd));

    _.each(
      glob.sync(path.join(swig.cwd, '/lib/**/com.gilt*.jar')),
      function (jarPath) {

        var jar = new Zip(jarPath),
          jarName = jarPath.match(/\/(com\.gilt.*)\.jar$/)[1],
          pkg = jar.getEntry('package.json');

        if (!pkg) {
          pkg = jar.getEntry('src/package.json');
        }

        if (pkg) {
          swig.log('Extracting dependencies from ' + jarName);

          deps = extract(JSON.parse(jar.readAsText(pkg)), deps, jarName);
        }
      }
    );

    deps = util.iterate(deps);

    if (deps) {
      util.generate(deps);
    }
    else {
      swig.log('JVM validation of dependencies failed.');
    }
  };
};