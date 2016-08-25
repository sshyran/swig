# swig module to for use with nova deploy tool

### Install:

Assuming you have a swig project already setup, in your project folder do the following:

Install module and save as a dev dependency

```
npm install @gilt-tech/swig-nova --save-dev
```

Add line to gulp file to load module for use:

```
printf "\nrequire('@gilt-tech/swig-nova')(gulp, swig);" >> gulpfile.js
```


### Usage

swig-nova uses the same conventions that nova tool uses for deploy locations. Envirnoments and stacks, when deploying you must specify both of these. For other options here's the output of the built in help accessible at `swig nova-deploy -h`:

```
Usage:
swig nova-deploy [options]

Options:
  --env            Name of environment in nova.yml to deploy to.
  --stack          Name of stack in nova.yml to deploy to.
  --new-version    Deploy a new version, valid options are (patch|minor|major). Version will
                   be incremented in package.json accordingly and tagged in git.
  --version        Specify new version manually. Value should be N.N.N and newer that latest
                   deployed version.
```


Links:

[swig](https://github.com/gilt/gilt-swig)
[nova deploy tool](https://github.com/gilt/nova)