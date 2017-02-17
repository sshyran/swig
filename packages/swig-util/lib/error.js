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
  swig.error = function (entityName, message) {
    const err = new Error((`[${entityName}] `).yellow + message.red);
    const stack = err.stack.split('\n');

    // remove this function from the stack
    stack.splice(1, 1);
    err.stack = stack.join('\n');

    throw err;
  };
};
