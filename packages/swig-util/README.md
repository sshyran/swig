# gilt-swig-util

Contains utility modules for swig.

### swig-util

Documentation forthcoming


### swig-log

Swig-log provides logging mechanisms to swig modules. The `log` object
is appended onto the swig-wide `swig` shared object.

Properties:

  - log.symbols
    This object is initally populated with unicode symbols from the npm module
     `log-symbols`. If --pretty=false is used, the unicode symbols are replaced
     with ascii representations.
    Available properties:
    - symbols.info
    - symbols.warning
    - symbols.error
    - symbols.success
    - symbols.connector
    - symbols.start

  - log.padding
    The default line padding used by the main function.

Methods:

  - log(what)
    Sends data to the terminal. eg. console.log.

  - log.confirm(question)
    Sends a question to the terminal and waits for user input. Returns the
    user's response.

  - log.error(prefix, what)
    Sends an 'error' line to the terminal.
    The line is prefixed with the error symbol, optional prefix text, and the
    data specified.

  - log.info(prefix, what)
    Sends an 'info' line to the terminal.
    The line is prefixed with the info symbol, optional prefix text, and the
    data specified.

  - log.padLeft(what, howMany)
    Pads a string at the beginning with the number of `log.padding` values
    specified.

  - log.padLeft(what, howMany)
    Pads a string at the end with the number of `log.padding` values
    specified.

  - log.success(prefix, what)
    Sends a 'success' line to the terminal.
    The line is prefixed with the success symbol, optional prefix text, and the
    data specified.

  - log.strip(what)
    Strips ansi colors from a string. Provided by the npm module `strip-ansi`.

  - log.task(name)
    Sends a 'task' line to the terminal.
    The line is prefixed with the start symbol and the name of the task.

  - log.verbose(what)
    Akin to `log(what)` but only if the --verbose flag is used.

  - log.warn(prefix, what)
    Sends an 'warning' line to the terminal.
    The line is prefixed with the warning symbol, optional prefix text, and the
    data specified.

  - log.write(what)
    Sends data to the terminal without a trailing newline.
