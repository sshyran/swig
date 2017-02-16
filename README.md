Swig
=========

Swig represents a pattern to manage a consistent gulp task structure across many projects and many developers within an organization.

The intention is to use Gulp as the community currently does, contribute to the Open Source Gulp community, encourage open development, reduce technical debt in tooling and encouraging collaboration.

### The What

Swig provides...

  - A quick and painless means to setup system requirements.
  - A consistent tooling task structure across the various web-app and module projects at an organization.
  - An automatic, unobtrusive update mechanism to keep all developers up to date.
  - Beautiful and meaningful output to the user for common tasks.
  - An optional environment launching point for Gulp.
  - Use of community-driven, open-source plugins that fit an organization’s unique needs whenever possible.
  - Tooling without the presence of proprietary code or tasks.

### The How

  Please reference the Technical Requirements below before proceeding.

  To use swig anywhere, you'll need swig-cli:

```
npm install -g @gilt-tech/swig
```

  To use swig in any directory:

```
swig init && swig
```

  We recommend adding swig to your user directory, making the tools swig provides available in most terminal sessions.


### Technical Requirements

  - [NVM](https://github.com/creationix/nvm)
    To manage and initialize the proper node versions for Swig to run.

  - Node.js v6, installed and managed by NVM. Once nvm is installed, run:

```
nvm install 6
```

  - [NPM](https://www.npmjs.com/package/download)
    Bundled with required Node.js.

## Use and Structure

### The Parent Module

These modules form the foundation of Swig.

  - `swig`  
    Intended to be installed globally and locally, following the same patterns as gulp and grunt,
    this module is the starting off point for using swig.

### CLI Flags

swig has a few flags that come in handy:

- `--poolparty`  
    Displays Gulp output and verbose output normally suppressed.

- `--pretty=false`  
    Instructs the output to strip colors and unicode characters.

- `--verbose`  
    Prints extended logging information.

### CLI Commands

- `swig`  
  The entry point for swig. If no parameters are used it prints out the help.

- `swig init`  
  Initializes swig within a local directory.

### Available Tasks

  In order to use the following tasks, the relative plugin module must be installed and listed in the app/module dependencies field in the package.json.

  - [swig-bundle](https://github.com/gilt/swig/tree/master/packages/swig-bundle): `swig bundle`  
    This task is responsible for the bundling of the Frontend assets

  - [swig-nova](https://github.com/gilt/swig/tree/master/packages/swig-nova): `swig nova-deploy`  
    This task simplifies the deployment of apps on AWS using the [`nova`](https://github.com/gilt/nova) tool

  - [swig-install](https://github.com/gilt/swig/tree/master/packages/swig-install): `swig install`  
    Installs all Frontend dependencies

  - [swig-lint](https://github.com/gilt/swig/tree/master/packages/swig-lint): `swig lint`  
    Lints javascript and less/css files and looks for other special considerations
    within a module or web-app's Frontend source files.

  - [swig-publish](https://github.com/gilt/swig/tree/master/packages/swig-publish): `swig publish`  
    Publishes modules to the npm registry configured in .npmrc.
    This task runs linting, validation, and specs prior to allowing the publish
    to take place.

  - [swig-spec](https://github.com/gilt/swig/tree/master/packages/swig-spec): `swig spec`  
    Runs specs for web applications, ui-* modules, and npm modules.

  - [swig-stub](https://github.com/gilt/swig/tree/master/packages/swig-stub): `swig stub`  
    Generates scaffolding for web applications and asset modules.

  - [swig-run](https://github.com/gilt/swig/tree/master/packages/swig-run): `swig run`  
    Runs a web application in an NVM isolated environment. Currently only supports
    Node.js applications which contain app.js at the root.

### Swig Utilities

[swig-util](https://github.com/gilt/swig/tree/master/packages/swig-util) was created to provide various commonly-used utilities for the swig ecosystem. In addition to
producing beautiful output through the use of `swig.log`, swig will also intelligently suppress certain
superfelous `gulp` output.

## Want to contribute?

Anyone can help make this project better - We follow the same contributing guide as the Gulp project. Please check out their [Contributing guide](https:d//github.com/gulpjs/gulp/blob/master/CONTRIBUTING.md)!

### Publishing

This project is using [Lerna](https://github.com/lerna/lerna), which makes versioning, publishing and tagging changes very simple.
Check the Lerna documentation to know more.
