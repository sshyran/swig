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

  gulp.task('bundle', ['spec', 'merge', 'create-revision', 'minify'], function () {
    return true;
  });


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

  gulp.task('merge', function () {

    // js - UICommons::Language::JavascriptMerger.merge
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
  });

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
