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

  /**
   * @name srcPath
   * @desc Get the srcPath of the application
   * @params {object} opts This is the Swig object
   * @returns {String}
   */
  swig.srcPath = function (opts) {
    let
      srcPath;

    if (opts.argv.src) {                                                                // Checking for passed terminal arguments, originates from Yargs
      srcPath = opts.argv.src;
    } else if (opts.pkg.gilt && (opts.pkg.gilt.srcPath || opts.pkg.gilt.publicPath)) {  // Checking for values passed in the node package.json
      srcPath = opts.pkg.gilt.srcPath || opts.pkg.gilt.publicPath;
    } else {                                                                            // Default path of the public folder for legacy apps
      srcPath = `${opts.target.path}/public`;
    }
    console.log('Working');
    return srcPath;
  }
}; 