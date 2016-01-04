#!/usr/bin/env node

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

require('colors');

var fs = require('fs'),
  path = require('path'),
  exec = require('child_process').exec,
  semverDiff = require('semver-diff'),
  strip = require('strip-ansi'),
  repeating = require('repeating'),
  pkg = require('../package.json'),
  configPath = path.join(__dirname, '../.update'),
  interval = 1000 * 60 * 60 * 24, // once a day
  encoding = 'utf8',
  line1 = '',
  line2 = 'Run ' + 'npm update @gilt-tech/swig -g'.blue + ' to update',
  line1Len = 0,
  line2Len = strip(line2).length,
  border = '',
  command = 'npm view @gilt-tech/swig dist-tags --json --loglevel=silent 2>&1',
  now = new Date(),
  runCheck = true,
  maxLen = 0,
  config,
  result,
  versions;

if (fs.existsSync(configPath)) {
  result = fs.readFileSync(configPath, encoding);
  config = JSON.parse(result);

  if (!config.error && config.latest && semverDiff(pkg.version, config.latest)) {
    runCheck = false;

    line1 = 'Update available: ' + config.latest.green + (' (current: ' + pkg.version + ')').gray;
    line1Len = strip(line1).length;

    maxLen = Math.max(line1Len, line2Len);
    border = repeating('─', maxLen + 4);

    if (maxLen > line1Len){
      line1 += repeating(' ', maxLen - line1Len);
    }
    else if (maxLen > line2Len) {
      line2 += repeating(' ', maxLen - line2Len);
    }

    console.log('┌' + border +       '┐');
    console.log('│  '.yellow + line1 + '  │'.yellow);
    console.log('│  '.yellow + line2 + '  │'.yellow);
    console.log('└' + border +      '┘');

    console.log('·');

    setTimeout(function () { process.exit(0); }, 2000);
  }
}

if (runCheck) {
  if (config && now - config.lastCheck < interval) {
    process.exit(0);
  }

  exec(command, { maxBuffer: 20 * 1024 * 1024 }, function (err, stdout, stderr){

    var exitCode = 0;

    if (err) {
      config = {
        error: err.toString(),
        src: 'exec'
      };
    }
    else {
      try {
        versions = JSON.parse(stdout);

        config = {
          latest: versions.latest || 'latest',
          current: pkg.version,
          lastCheck: now.getTime()
        };
      }
      catch (e) {
        config = {
          error: e.toString(),
          src: 'JSON'
        };

        exitCode = 1;
      }
    }
    if (config.error) {
      console.log('.  Sad Panda, Error Panda'.red + ' writing error info to: ' + configPath);
      console.log('.  Error Info: '.red + '\n' + JSON.stringify(config, null, 2));    // outputting info here also as useful for failure during docker build for example where you do not have ready access to filesystem easily
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), encoding);
    process.exit(exitCode);
  });
}
