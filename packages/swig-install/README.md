Meant to be used via the [Swig CLI][1], just run:

```
swig install
```

Swig install does an npm install on dependencies and then copies those dependencies to a public folder to be served by
the app. The default 'public' directory for apps is /web/APP-NAME/public but you can also specify a target directory
for public assets e.g. the usual Scala play public folder can be 'target' or 'main/resources' etc.

For example:

```
swig install --public ~Code/web/web-mosaic/target/public
```

If you're fixing IE11 issues locally you may want to use the --transpile flag
during `swig install`. It adds a final step that transpiles all JS once it's
finished installing to `/public/js`. It's not needed on canary etc because the
minification step takes care of it.

E.g.

```
swig install --transpile
```