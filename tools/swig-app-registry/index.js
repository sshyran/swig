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
    prompt = require('co-prompt'),
    thunkify = require('thunkify'),
    request = require('request'),
    path = require('path'),
    fs = require('fs'),

    get = thunkify(request.get),
    registryPath = path.join(swig.home, 'app-registry.json'),
    registry,
    updated = false;

  function * download () {
    var response,
      json;

    try {
      swig.log('Downloading the Application Registry...');
      response = yield get('http://application-registry.gilt.com/application_registry/1.0');
      json = response.length ? response[0].body : null;

      fs.writeFileSync(registryPath, json);
      updated = true;

      swig.log('DONE');
    }
    catch (e) {
      swig.log('FAILURE');
      swig.log(e);
    }
  }

  function * check () {
    var prompts = {
        noent: 'You\'ll need a copy of the Application Registry to use this tool. Download it now?',
        update: 'Your copy of the Application Registry is pretty old. Download an update now?'
      },
      response,
      stat,
      diff;

    if (!fs.existsSync(registryPath)) {
      response = yield swig.log.confirm(prompts.noent);
      if (response) {
        yield download();
      }
      else {
        swig.log('Ah well, maybe later.');

        return false;
      }
    }
    else {
      stat = fs.statSync(registryPath);
      diff = Math.abs(stat.mtime.getTime() - (new Date()).getTime());
      diff = diff / 1000 / 60 / 60 / 24 / 7;

      // if the file is older than a week
      if (diff > 7) {
        response = yield swig.log.confirm(prompts.update);
        if (response) {
          yield download();
        }
      }
    }

    return true;
  }

  function transform (registry) {

    var result = {};

    _.each(registry.data.applications, function (app) {
      result[app.name] = app;
    });

    return result;
  }

  gulp.task('app-registry', co(function *() {

    var result = yield check();

    if (!result) {
      return;
    }

    swig.log('Loading the Application Registry...');

    if (!updated && swig.appRegistry) {
      return;
    }

    registry = require(registryPath);

    if (!registry || !registry.data || !registry.data.applications || !registry.data.applications.length) {
      swig.log('FAILED'.red);
      swig.log('Application Registry is invalid.');
    }
    else {
      registry = transform(registry);
      swig.log('DONE');
    }

    swig.appRegistry = registry;
  }));

};