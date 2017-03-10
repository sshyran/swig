### 2.1.0
**Improvements**
  - `swig-lint`

    It is now possible to opt-in for a Stylelint based linting of CSS/LESS files, via the new
    `--use-stylelint` flag.


### 2.0.0
**General Notes**
 - Aggregated all Swig related packages under one repository.
 - Implemented Lerna based structure and workflow.

**Breaking Changes**
 - `swig-cli`

   It no longer comes with the following plugins preinstalled:
   - `swig-assets`
   - `swig-bundle`
   - `swig-install`
   - `swig-lint`
   - `swig-merge-css`
   - `swig-minify`
   - `swig-publish`
   - `swig-release-email`
   - `swig-spec`
   - `swig-stub`
   - `swig-transpile-scripts`

   In order to use the above plugin, the consumer must install them as dependencies of the
   app/module and make sure that they are saved in the `package.json`.

   This was necessary to avoid conflicts with plugins versions when upgrading the globally installed
   `swig-cli` but not the local one, or viceversa.

 - `swig-lint`

   It now requires an `.eslintrc.yml` file to be present in the target app/module
   folder.

 - `swig-zk`, `swig-app-registry`

   Removed from the Swig ecosystem of plugins. You can still use them, but no new version
   will be released. There's no plan to support them anymore.

 - `swig-run`

   It does not use `swig-zk` to run Zookeeper before starting the app anymore.

**Minor Changes**
 - `swig-cli`

    It no longer requires a `gulpfile.js` to be provided by the consumer, and it also does not
    require `gulp` to be installed globally nor locally.

 - `swig-transpile-scripts`

   It no longer prints a log of every single file that has been transpiled by default.

   In case you need that additional information, you will need to run it with `--verbose` flag.


### 1.3.0
**Improvements**
  - Removed call to `harmonize` module for Node 6 and above.
    The use of this module was creating an issue with `yarn` based installations.
  - We can now safely use `yarn`! 🍾


### 1.2.0
**Improvements**
  - Better `node` version check.
  - Made `node` v6 the minimum version required.


### 1.1.0
**Improvements**
  - Made swig tasks overridable via locally installed dependencies


### 1.0.0
**Breaking Changes**
  - The reworked `swig assets-deploy` will now produce JS artifacts inside the
    `public/js/<app-name>/app` folder. The bundler will fetch from that folder
    and will continue to create merged/minified assets in `public/js/<app-name>`
    Applications that were defining their dependencies by prefixing their id
    with `src.` must now change it to `app.` or start using ES6 modules instead.

**Improvements**
  - Introduced new `swig transpile-scripts` task, used to transform ES6 and
    React JSX code to ES5 code.
  - Added new watcher to the run task to automatically transpile scripts:
    `swig run --watch-scripts`. You can also call it standalone with
    `swig watch-scripts`.
