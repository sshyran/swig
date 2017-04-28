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

