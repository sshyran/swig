module.exports = function (swig) {

  swig.email = function * swigEmail (options) {

    if (!swig.rc.smtpServer) {
      swig.log.error('swig.email', 'The smtpServer property is missing in .swigrc. Cannot send email.');
      return null;
    }

    var nodemailer = require('nodemailer'),
      thunkify = require('thunkify'),
      transport = nodemailer.createTransport({
        host: swig.rc.smtpServer
      }),
      result;

    transport.sendMail = thunkify(transport.sendMail);

    result = yield transport.sendMail(options);

    return result;
  };
}