#!/usr/bin/env node


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

require('colors');

const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const semverDiff = require('semver-diff');
const strip = require('strip-ansi');
const repeating = require('repeating');
const pkg = require('../package.json');

const configPath = path.join(__dirname, '../.update');
const interval = 1000 * 60 * 60 * 24; // once a da;
const encoding = 'utf8';

let line2 = `Run ${'npm install -g @gilt-tech/swig'.blue} to update`;
const line2Len = strip(line2).length;
const command = 'npm view @gilt-tech/swig dist-tags --json --loglevel=silent 2>&1';
const now = new Date();
let line1 = '';
let line1Len = 0;
let border = '';
let runCheck = true;
let maxLen = 0;
let config;
let result;
let versions;

if (fs.existsSync(configPath)) {
  result = fs.readFileSync(configPath, encoding);
  config = JSON.parse(result);

  if (!config.error && config.latest && semverDiff(pkg.version, config.latest)) {
    runCheck = false;

    line1 = `Update available: ${config.latest.green}${(` (current: ${pkg.version})`).gray}`;
    line1Len = strip(line1).length;

    maxLen = Math.max(line1Len, line2Len);
    border = repeating(maxLen + 4, '─');

    if (maxLen > line1Len) {
      line1 += repeating(maxLen - line1Len, ' ');
    } else if (maxLen > line2Len) {
      line2 += repeating(maxLen - line2Len, ' ');
    }

    console.log(`┌${border}┐`);
    console.log('│  '.yellow + line1 + '  │'.yellow);
    console.log('│  '.yellow + line2 + '  │'.yellow);
    console.log(`└${border}┘`);

    console.log('·');

    setTimeout(() => { process.exit(0); }, 2000);
  }
}

if (runCheck) {
  if (config && now - config.lastCheck < interval) {
    process.exit(0);
  }

  exec(command, { maxBuffer: 20 * 1024 * 1024 }, (err, stdout) => {
    let exitCode = 0;

    if (err) {
      config = {
        error: err.toString(),
        src: 'exec'
      };
    } else {
      try {
        versions = JSON.parse(stdout);

        config = {
          latest: versions.latest || 'latest',
          current: pkg.version,
          lastCheck: now.getTime()
        };
      } catch (e) {
        config = {
          error: e.toString(),
          src: 'JSON'
        };

        exitCode = 1;
      }
    }
    if (config.error) {
      console.log(`${'.  Sad Panda, Error Panda'.red} writing error info to: ${configPath}`);
      /*  outputting info here also as useful for failure during docker build for example
          where you do not have ready access to filesystem easily  */
      console.log(`${'.  Error Info: '.red}\n${JSON.stringify(config, null, 2)}`);
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), encoding);
    process.exit(exitCode);
  });
}
