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

const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const thisPkg = require('../package.json');
require('colors');

const execOpts = {
  maxBuffer: 500 * 1024       // default is 200*1024
};
const templates = {
  pkg: fs.readFileSync(path.join(__dirname, '../templates/package.json'))
};
const paths = {
  pkg: path.join(process.cwd(), 'package.json')
};
const isUsingYarn = process.argv.includes('--use-yarn');
let installCommand = 'npm install --loglevel=warn 2>&1';
let installError = null;
let installer = 'npm';
let pkg;

if (isUsingYarn) {
  installCommand = 'yarn install 2>&1';
  installer = 'yarn';
}


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
} else {
  console.log('Creating a package.json for great justice.');
  fs.writeFileSync(paths.pkg, templates.pkg);
}

console.log(`Running ${installer} install...`.yellow);

// run ui install
const cp = exec(installCommand, execOpts, (error) => {
  if (error) {
    installError = error.toString();
  }
});

cp.on('close', () => {
  if (installError !== null) {
    console.log((`Swig initialization failed on ${installer} install. ${installError}`).red);
  } else {
    console.log('Swig initialization is complete. Feel free to make loud animal noises.'.green);
  }
});

(function capture(stdout) {
  let buff = '';
  stdout.on('data', (data) => {
    buff += data.toString('utf8');

    if (buff.indexOf('\n') > -1) {
      console.log(`  ${buff.trim()}`);
      buff = '';
    }
  });
}(cp.stdout));
