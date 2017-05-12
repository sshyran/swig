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
   * @desc Get the srcPath of the application, in order terminal params, package object, defaults
   * @params {object} opts This is the Swig object
   * @returns {String}
   */
  swig.srcPath = function (opts) {
    let
      srcPath;
    
    if (opts.argv.src) {                                                                
      srcPath = opts.argv.src;
    } else if (opts.pkg.gilt && (opts.pkg.gilt.srcPath || opts.pkg.gilt.publicPath)) { 
      srcPath = opts.pkg.gilt.srcPath || opts.pkg.gilt.publicPath;
    } else {                                                                            
      srcPath = `${opts.target.path}/public`;
    }
    return srcPath;
  }
}; 
