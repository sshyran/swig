module.exports = function (swig) {
  swig.email = function* swigEmail(options) {
    if (!swig.rc.smtpServer) {
      swig.log.error('swig.email', 'The smtpServer property is missing in .swigrc. Cannot send email.');
      return null;
    }

    const nodemailer = require('nodemailer');
    const thunkify = require('thunkify');
    const transport = nodemailer.createTransport({
      host: swig.rc.smtpServer
    });

    transport.sendMail = thunkify(transport.sendMail);

    return yield transport.sendMail(options);
  };
};
