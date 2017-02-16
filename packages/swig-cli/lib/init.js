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

var fs = require('fs'),
  path = require('path'),
  exec = require('child_process').exec,
  thisPkg = require('../package.json'),
  execOpts = {
    maxBuffer: 500*1024       // default is 200*1024
  },
  installError = null,
  templates = {
    pkg: fs.readFileSync(path.join(__dirname, '../templates/package.json'))
  },
  paths = {
    pkg: path.join(process.cwd(), 'package.json')
  },
  installCommand = 'npm install --loglevel=warn 2>&1',
  isUsingYarn = process.argv.includes('--use-yarn'),
  installer = 'npm',
  pkg;

if (isUsingYarn) {
  installCommand = 'yarn install 2>&1';
  installer = 'yarn';
}

require('colors');

console.log('\nSwig is about to make your project funky fresh...'.cyan);

if (fs.existsSync(paths.pkg)) {
  console.log('I spy an existing project. Spicing up your package.json with the Swig deps...'.yellow);
  pkg = require(paths.pkg);
  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }
  if (!pkg.devDependencies['@gilt-tech/swig']) {
    pkg.devDependencies['@gilt-tech/swig'] = `^${thisPkg.version}`;
    fs.writeFileSync(paths.pkg, JSON.stringify(pkg, null, 2));
  }
}
else {
  console.log('Creating a package.json for great justice.');
  fs.writeFileSync(paths.pkg, templates.pkg);
}

console.log(`Running ${installer} install...`.yellow);

// run ui install
var cp = exec(installCommand, execOpts, function (error, stdout, stderr){
  if (error) {
    installError = error.toString();
  }
});

cp.on('close', function () {
  if (installError !== null) {
    console.log((`Swig initialization failed on ${installer} install. ${installError}`).red);
  } else {
    console.log('Swig initialization is complete. Feel free to make loud animal noises.'.green);
  }
});

(function capture (stdout) {
  var buff = '';
  stdout.on('data', function (data) {
    buff += data.toString('utf8');

    if (buff.indexOf('\n') > -1) {
      console.log('  ' + buff.trim());
      buff = '';
    }
  });
})(cp.stdout);
