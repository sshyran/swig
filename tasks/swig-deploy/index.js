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

  gulp.task('deploy', ['deploy-nfs', 'deploy-s3', 'deploy-configs'], function () {
    return true;
  });

  gulp.task('deploy-nfs', function () {
    // UICommons::Environment.env(args[:environment])
    // quit UICommons::EXIT_CODES::TASK_FAILED unless UICommons::Results.continuous :title => "Deploying #{UICommons::Config.public_repo_name} Assets #{@revision} to NFS" do |result|
    //   UICommons.deploy result
    // end
  });

  gulp.task('deploy-s3', function () {
    // if args[:environment] == 'prod'
    //   UICommons::Environment.env(args[:environment])
    //   quit UICommons::EXIT_CODES::TASK_FAILED unless UICommons::Results.continuous :title => "Deploying #{UICommons::Config.public_repo_name} Assets #{@revision} to S3" do |result|
    //     UICommons.deploy_s3 result
    //   end
    // else
    //   puts UICommons::Results.yellow_text 'S3 Deploy is currently only for Prod'
    // end
  });

  gulp.task('deploy-configs', function () {
    // UICommons::Environment.env(args[:environment])

    // if UICommons::Config.create_assets_version_file == true
    //   quit UICommons::EXIT_CODES::TASK_FAILED unless UICommons::Results.continuous :title => "Updating #{UICommons::Config.public_repo_name} assets.version file to version #{@revision}" do |result|
    //     UICommons.update_assets_version_file result
    //   end
    // end
  });
};

   //  def self.deploy(result)
   //    host = UICommons::Environment.asset_share_host
   //    repo_name = UICommons::Config.public_repo_name
   //    revision = UICommons::Config.revision
   //    src_folder = UICommons::Config.repo_root + "/" +UICommons::Config.public_root
   //    modules = {}
   //    success = true

   //    if host.empty?
   //      success = false
   //    else
   //      UICommons::Config.deploy_folders.split(',').each do |dir|
   //        begin
   //          output = %x{rsync --archive --recursive --compress "#{src_folder}/#{dir}/#{repo_name}/" "#{host}/#{dir}/#{repo_name}/#{revision}"}

   //          success &&= $?.success?

   //          if modules[dir].nil?
   //            modules[dir] = {
   //              :filename => "#{host}/#{dir}/#{repo_name}/#{revision}",
   //              :success => $?.success?,
   //              :output => output
   //            }
   //          end

   //          if UICommons::Config.create_latest_bundle_symlink
   //            latest_bundle = "#{src_folder}/#{dir}/#{repo_name}/latest_bundle"
   //            File.unlink(latest_bundle) rescue nil
   //            File.symlink(revision, latest_bundle)
   //            output = %x{rsync --archive --compress "#{latest_bundle}" "#{host}/#{dir}/#{repo_name}"}
   //            File.unlink(latest_bundle) rescue nil # Cleanup otherwise problems in rpm war build

   //            success &&= $?.success?

   //            modules[dir + '-latest_bundle'] = {
   //              :filename => latest_bundle,
   //              :success => $?.success?,
   //              :output => output
   //            }

   //          end

   //        rescue Exception => e
   //          puts e
   //          success = false
   //          exit
   //        end
   //      end
   //    end

   //    results = modules.values.sort_by{|r|r[:filename]}

   //    results.each do |r|
   //      result.push r
   //    end

   //    result.close(:success => success)
   //  end

   // def self.deploy_s3(result)
   //    host = UICommons::Environment.s3_host
   //    repo_name = UICommons::Config.public_repo_name
   //    revision = UICommons::Config.revision
   //    src_folder = UICommons::Config.repo_root + '/' +UICommons::Config.public_root
   //    modules = {}
   //    success = true



   //    UICommons::Config.deploy_folders.split(',').each do |dir|
   //      begin

   //        puts "S3 deploy command:"
   //        puts "  #{File.join(File.dirname(__FILE__), '../bin/s3cmd')} sync #{src_folder}/#{dir}/#{repo_name}/ #{host}/#{dir}/#{repo_name}/#{revision}/ 2>&1\n"

   //        output = %x{#{File.join(File.dirname(__FILE__), '../bin/s3cmd')} sync #{src_folder}/#{dir}/#{repo_name}/ #{host}/#{dir}/#{repo_name}/#{revision}/ 2>&1}

   //        puts "S3 deploy raw output:"
   //        puts "  #{output}\n"

   //        success &&= $?.success?

   //        if modules[dir].nil?
   //          modules[dir] = {
   //            :filename => "#{host}/#{dir}/#{repo_name}/#{revision}",
   //            :success => $?.success?,
   //            :output => output
   //          }
   //        end
   //      rescue Exception => e
   //        puts e
   //        success = false
   //        exit
   //      end
   //    end

   //    results = modules.values.sort_by{|r|r[:filename]}

   //    results.each do |r|
   //      result.push r
   //    end

   //    result.close(:success => success)
   //  end