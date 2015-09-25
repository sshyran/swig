FROM giltcommon/nodejs-v11

# set NODE_ENV production so we're not installing devDependencies
ENV NODE_ENV production
ENV GILT_ENV production

# expose the internal port the node app runs on this gets replaced by the makefile
EXPOSE 17652

# set the working directory
WORKDIR /app

# add our files, sans node_modules, to the app dir
ADD . /app

# copy the user's ~/.swigrc &  ~/.npmrc file to the image's HOME dir
COPY .npmrc /root/.npmrc
COPY .swigrc /root/.swigrc
ENV PWD /app

# set default shell to bash, required by swig
RUN ln -sf /bin/bash /bin/sh

# At the end of the next collection of command we remove the dtrace_provider
# _optional_ dependency of bunyan. It causes trouble on osx with node v11 and
# we do not require it.
RUN npm install -g swig-cli gulp swig-project --loglevel http --color false && \
    npm install gulp swig-project --loglevel http --color false && \
    npm dedupe --loglevel http --color false && \
    swig install && \
    rm -rf node_modules/bunyan/node_modules/dtrace_provider

# Fire up node
CMD ["node", "--harmony", "app.js"]