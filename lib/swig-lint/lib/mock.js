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
    through = require('through2'),
    regex = require('./mock-regex');

  if (!String.prototype.scan) {
    // http://stackoverflow.com/a/13895463
    String.prototype.scan = function (re) {
      if (!re.global) {
        throw 'regex must have \'global\' flag set';
      }
      var s = this;
      var m, r = [];
      /* jshint boss: true */
      while (m = re.exec(s)) {
        /* jshint boss: false */
        m.shift();
        r.push(m);
      }
      return r;
    };
  }

  function extract (file, content) {

    var mixins,
      variables,
      imports;

    mixins = _.flatten(content.scan(regex.mixin).concat(content.scan(regex.altMixin)));
    mixins = _.uniq(mixins);
    mixins = _.reject(mixins, function (mixin) {
      return regex.hex.test(mixin);
    });

    variables = _.flatten(content.scan(regex.variable));
    variables = _.uniq(variables);
    variables = _.reject(variables, function (variable) {
      return _.include(['import', 'media'], variable);
    });

    imports = _.uniq(_.flatten(content.scan(regex['import'])));
    imports = _.map(imports, function (imp) {

      imp = path.join(path.dirname(file), imp.slice(1, -1));

      if (fs.exists(imp)) {
        return extractMixinsAndVariables(imp, fs.readFileSync(imp));
      }
    });
    imports = _.compact(imports);

    _.each(imports, function (data) {
      [].push.apply(mixins, data.mixins);
      [].push.apply(variables, data.variables);
    });

    return {
      mixins: mixins,
      variables: variables
    };
  }

  function mock (file, content, data) {

    var mock = _.map(data.mixins, function (mixin) {
      var curlies = 0;

      mixin = mixin
        .replace(/(\w+)(\.\w+)/g, '$1 $2') // take overqualified selectors (e.g. .foo.bar) and split them up (e.g. .foo .bar)
        .replace(/>|\s+/g, function () { curlies += 1; return '{'; })
        .replace(/\{{2,}/g, function (c) { curlies -= (c.length - 1); return '{'; }) +
        '(...){}';

      mixin += _.reduce(_.range(curlies), function (c) { return c + '}'; }, '');

      return mixin;
    }),
    mockLength;

    mock = mock.concat(_.map(data.variables, function (variable) {
      var value = 'none'; // default value -- acceptable in all CSS contexts (IIRC)

      // detect if the variable is being used in a LESS context where an
      // internal functions will attempt to perform operations on it, e.g.
      // math, or color manipulation
      if (
        content.match(new RegExp('@' + variable + '\\s*[/+*-]')) ||
        content.match(new RegExp('[/+*-]\\s*@' + variable)) ||
        content.match(new RegExp('fade(?:in|out)\\(@' + variable)) // this list is FAR from complete. the full list is... long... very.
      ) {
        value = '#fff'; // all math functions in less will accept a color as an operand
      }

      return '@' + variable + ': ' + value + ';';
    }));

    mock = mock.join('\n').trim();
    mockLength = (data.mixins.length + data.variables.length + 1);
    mock = '// mock-length: ' + mockLength + '\n' + mock + '\n';
    file.mockLength = mockLength;

    content = mock + content.replace(regex['import'], '');
    return content;
  }

  return function plugin () {

    var content,
      data;

    return through.obj(function (file, enc, cb) {
      if (file.isBuffer()) {
        content = file.contents.toString();
        data = extract(file.path, content);
        content = mock(file, content, data)
        file.contents = new Buffer(content);
      }

      this.push(file);
      cb();
    });

  };
};