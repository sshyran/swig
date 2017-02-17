

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

module.exports = function () {
  const _ = require('underscore');
  const fs = require('fs');
  const path = require('path');
  const through = require('through2');
  const regex = require('./mock-regex');

  if (!String.prototype.scan) {
    // http://stackoverflow.com/a/13895463
    // eslint-disable-next-line
    String.prototype.scan = function (re) {
      if (!re.global) {
        throw new Error('regex must have \'global\' flag set');
      }
      const s = this;
      const r = [];
      let m;
      // eslint-disable-next-line
      while (m = re.exec(s)) {
        m.shift();
        r.push(m);
      }
      return r;
    };
  }

  function extract(file, content) {
    let mixins;
    let variables;
    let imports;

    mixins = _.flatten(content.scan(regex.mixin).concat(content.scan(regex.altMixin)));
    mixins = _.uniq(mixins);
    mixins = _.reject(mixins, mixin => regex.hex.test(mixin));
    mixins = _.map(mixins, (mixin) => {
      // in the event that the mixin regex returns something like
      // '#gradient > .vertical', we need the last bit to create
      // the mixin mock
      const matches = mixin.match(/(\.[a-z]+)/ig);

      if (matches && matches.length) {
        return matches[matches.length - 1];
      }
      return mixin;
    });
    mixins = _.uniq(mixins);

    console.log(mixins);

    variables = _.flatten(content.scan(regex.variable));
    variables = _.uniq(variables);
    variables = _.reject(variables, variable => _.include(['import', 'media'], variable));

    imports = _.uniq(_.flatten(content.scan(regex.import)));
    imports = _.map(imports, (imp) => {
      imp = path.join(path.dirname(file), imp.slice(1, -1));

      if (fs.exists(imp)) {
        // FIXME: is this function `extractMixinsAndVariables` defined somewhere globally??
        // eslint-disable-next-line
        return extractMixinsAndVariables(imp, fs.readFileSync(imp));
      }
    });
    imports = _.compact(imports);

    _.each(imports, (data) => {
      [].push.apply(mixins, data.mixins);
      [].push.apply(variables, data.variables);
    });

    return {
      mixins: mixins,
      variables: variables
    };
  }

  function mockFn(file, content, data) {
    let mock = _.map(data.mixins, (mixin) => {
      let curlies = 0;

      mixin = `${mixin
      .replace(/(\w+)(\.\w+)/g, '$1 $2') // take overqualified selectors (e.g. .foo.bar) and split them up (e.g. .foo .bar)
      .replace(/>|\s+/g, () => { curlies += 1; return '{'; })
      .replace(/\{{2,}/g, (c) => { curlies -= (c.length - 1); return '{'; })
      }(){}`;

      mixin += _.reduce(_.range(curlies), c => `${c}}`, '');

      return mixin;
    });

    mock = mock.concat(_.map(data.variables, (variable) => {
      let value = 'none'; // default value -- acceptable in all CSS contexts (IIRC)

      // detect if the variable is being used in a LESS context where an
      // internal functions will attempt to perform operations on it, e.g.
      // math, or color manipulation
      if (
        content.match(new RegExp(`@${variable}\\s*[/+*-]`)) ||
        content.match(new RegExp(`[/+*-]\\s*@${variable}`)) ||
        content.match(new RegExp(`fade(?:in|out)\\(@${variable}`)) // this list is FAR from complete. the full list is... long... very.
      ) {
        value = '#fff'; // all math functions in less will accept a color as an operand
      }

      return `@${variable}: ${value};`;
    }));

    mock = mock.join('\n').trim();
    const mockLength = (data.mixins.length + data.variables.length + 1);
    mock = `// mock-length: ${mockLength}\n${mock}\n`;
    file.mock = mock;
    file.mockLength = mockLength;

    content = mock + content.replace(regex.import, '');
    return content;
  }

  return function plugin() {
    let content;
    let data;

    return through.obj(function (file, enc, cb) {
      if (file.isBuffer()) {
        content = file.contents.toString();
        data = extract(file.path, content);
        content = mockFn(file, content, data);
        file.contents = new Buffer(content);
      }

      this.push(file);
      cb();
    });
  };
};
