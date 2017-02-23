module.exports = function (app, router) {
  return {
    get: {
      '': function* checkout(next, controller, locals) {
        locals.metaData = locals.metaData || {};
        locals.metaData.title = 'Gilt Web App';

        // this will set the response body to 'Gilt Web App'
        // if you don't know what a response is, please read up
        // on http requests and responses before proceding.
        this.body = 'Gilt Web App';

        // if you want to render a view, you need to create a view
        // in lib/views. views are handlebars templates. if you're
        // not familiar with mvc practices and patterns, please read
        // up on them before proceding.

        // chassis data, navigation, and footer will only be available
        // to views that are rendered, as they're rendered within the
        // master layout. get to know the ui-node repository if you want
        // to know more.

        // uncomment the following line if you want to render a view
        // this.render('view-name', locals);
      }
    }
  };
};
