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
    co = require('co'),
    exec = require('co-exec'),
    path = require('path'),
    globby = require('globby'),
    fs = require('fs'),

    modules = {
      full: [],
      intermediate: [],
      minimum: [],
      all: [],
      bundled: {}
    };

  // uses npm to tell us which modules are installed
  // we run this on the node_modules directory in temp because npm can make sense of it.
  function * parseDeps (name) {
    var commands = [
        'cd ' + swig.temp,
        'npm ll --parseable ' + (name || '')
      ],
      raw = yield exec(commands.join('; ')),
      lines = raw.split('\n'),
      deps = [];

    deps = _.map(lines, function (line) {
      var parts,
        moduleName,
        version;

      if (line && line.length) {
        line = path.basename(line);
        parts = line.split(':');

        if (parts.length) {
          parts = parts[1].split('@');
          moduleName = parts[0];
          version = parts[1];

          if (moduleName && version) {
            return { name: moduleName, version: version };
          }
        }
      }

      return null;
    });

    deps = _.reject(deps, function (dep) { return _.isNull(dep); });

    return deps;
  }

  function findBundles (deps) {
    var bundles = [],
      publicPath = path.join(swig.target.path, '/public/**/*.js');

    // find files that contain 'bundle: [name]'
    _.each(globby.sync(publicPath), function (file) {
      var content = fs.readFileSync(file, { encoding: 'utf-8' }),
        test = /bundle\:(\s?)\'(.+)\'/,
        matches,
        parts,
        moduleName,
        moduleFile;

      if (content && content.match) {
        matches = content.match(test);
      }

      if (matches && matches.length && matches.length === 3) {

        // parse the module name, and file name from the file path
        parts = file.split('/');
        moduleName = parts[parts.length - 3] + '.' + parts[parts.length - 2];
        moduleFile = parts[parts.length - 1];

        bundles.push({
          name: matches[2],
          moduleName: moduleName,
          file: moduleFile,
          path: file
        });
      }
    });

    return bundles;
  }

  gulp.task('bundle', [/* 'spec' */, 'merge', 'create-revision', 'minify'], function () {
    return true;
  });

// https://www.npmjs.org/package/gulp-cssimport

  gulp.task('minify', function () {

    // js - uglify --output
    // css - clean-css -o
    // less - lessc -x
    // handlebars - handlebars -s -r

    // UICommons::Environment.env(args[:environment])

    // #noinspection RubySimplifyBooleanInspection
    // quit UICommons::EXIT_CODES::TASK_FAILED if false == UICommons::Results.continuous(:title => 'Minified', :pass_action => 'minified') do |result|
    //   UICommons::Language.minify(result, package_folders, false)
    // end
  });

  gulp.task('merge', co(function *() {

    modules.all = yield parseDeps();
    modules.bundles = findBundles(modules.all);

    console.log(modules.bundles);

    // remove bundled modules from modules.all
    // var bundleNames = _.map(modules.bundles, function (bundle) { return bundle.name; });

    // modules.all = _.reject(modules.all, funciton (module) {
    //   return _.contains(bundleNames, module.name);
    // });

    // js - UICommons::Language::JavascriptMerger.merge
    /*
      RULES
      - targetExperiences: ['intermediate', 'full']
        - only shows up in intermediate or full
      - everything goes into flat files

      main.[exp].[src|min].js
      - modules are scanned for target experiences
      - if they are part of a bundle, skip
      - modules (and their deps) with target exps are placed into the corresponding main.[exp] file
      - modules without are placed in all three target exps

      [module].[exp].[src|min].js
      - modules which declare a bundle
      - the root declaring module, and it's deps are placed into [module].[exp] file.
      - if a dependency already exists in the main.**.js file, skip the dep.

      NOTES
      - this is going to require setting up objects first:
      - produce dependency graph
      - populate main.all

      main: {
        full: [],
        intermediate: [],
        minimum: [],
        all: [],
        bundled: []
      }

      main.all will be populated first.
      main.bundled will be populated second, iterating through main.all.
      main.all will remove anything which is also in main.bundled
      main.[exp] populated based on main.all
        - anything without a target exp will be in all three exps.

      [bundle]: {
        full: [],
        intermediate: [],
        minimum: []
      }

      bundle created based on main.bundled.
    */
    // css - UICommons::Language::CSSMerger.merge
    // less - lessc

    // UICommons::Environment.env(args[:environment])

    // #noinspection RubySimplifyBooleanInspection
    // quit UICommons::EXIT_CODES::TASK_FAILED if false == UICommons::Results.continuous(:title => 'Merging', :pass_action => 'merged') do |result|
    //   UICommons::Language.merge(result, package_folders, false)
    // end

    // css/less merger
     // public

     //    def self.merge(filename)

     //      result = merge_file(filename)

     //      File.open(filename.gsub(/(\.src)?\.css$/, '.src.css'), 'w') do |file|
     //        file.print result
     //      end

     //    end

     //  private

     //    def self.merge_file(filename)
     //      output = ''

     //      if File.exists? filename

     //        File.open filename do |file|

     //          file.readlines.each do |line|
     //            if line =~ /^\s*@import\s+(?:url\()?(['"]?)([\w\.\-\/]+)\1/
     //              output << merge_file(File.expand_path($2, File.dirname(filename)))
     //            else
     //              output << line
     //            end
     //          end

     //        end

     //      else
     //        raise "File Not Found: #{filename}"
     //      end

     //      output
     //    end
  }));

  gulp.task('create-revision', function () {
    // is_sbt_project = File.exists?('./build.sbt')

    // UICommons::Environment.env(args[:environment])

    // if is_sbt_project && UICommons::Environment.env != :dev
    //   if File.exists?(UICommons::Config.assets_version_file)
    //     File.open(UICommons::Config.assets_version_file, 'rb') { |file|
    //       @revision = file.read.strip
    //     }
    //   end
    // end

    // @revision ||= "#{Time.now.strftime('%Y%m%d%H%M')}-#{%x{cd #{UICommons::Config.repo_root} && git rev-parse HEAD}.strip[0..9]}"
    // UICommons::Config.revision = @revision
  });

};
