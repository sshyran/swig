

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
  return function jvm() {
    const _ = require('underscore');
    const path = require('underscore');
    const Zip = require('adm-zip');
    const glob = require('glob');
    let deps;

    swig.log();
    swig.log.task('Merging JVM App Package(s)');

    deps = util.extract(swig.pkg, {}, path.basename(swig.cwd));

    _.each(
      glob.sync(path.join(swig.cwd, '/lib/**/com.gilt*.jar')),
      (jarPath) => {
        const jar = new Zip(jarPath);
        const jarName = jarPath.match(/\/(com\.gilt.*)\.jar$/)[1];
        let pkg = jar.getEntry('package.json');

        if (!pkg) {
          pkg = jar.getEntry('src/package.json');
        }

        if (pkg) {
          swig.log.task(`Extracting dependencies from ${jarName.bold}`);

          deps = util.extract(JSON.parse(jar.readAsText(pkg)), deps, jarName);
        }
      }
    );

    deps = util.iterate(deps);

    if (deps) {
      util.generate(deps);
    } else {
      swig.log.error('install:merge-jvm', 'JVM validation of dependencies failed.');
      process.exit(0);
    }
  };
};
