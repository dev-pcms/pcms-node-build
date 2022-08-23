This package provides workaround for 
[well](https://stackoverflow.com/questions/67964556/cant-support-npm-link-added-local-package-in-vite-cli)-[known](https://stackoverflow.com/questions/56906896/cannot-use-vue-component-library-with-npm-link) [issue](https://stackoverflow.com/questions/65501715/vue-3-component-incorrectly-initialized-when-module-is-npm-linked) 
that `npm link`-ing and NPM local path dependencies do not work with Vue and Vite.

This package copies required dependencies to the proper place in the `node_modules` package instead of linking them. 
It works, but requires semi-manual dependency updates.

## Dependencies Description Format

### package.json
The `package.json` file has a new property `pcms-node-build`, that specifies:
* `node-copy` required only for packages that has dependents. 
  It specifies a list of files and directories provided for dependent packages.
* `dependencies` specifies list of local dependencies in the followin form
  ```
   node-package-name: {properties}
  ```
* `registry` a relative location of local packages' registry.

### Registry File Format

Registry file is a simple `.json` file that contains a sole object in the form
```
{ "dependency-name": "dependency-path" }
```
Dependency paths a relative to registry file
For example:
```
{
  "@pcms/pcms-remote-vue": "remote/vue",
  "@pcms/pcms-shell-vue": "shell/vue"
}

```

## Linked Dependencies
You can specify linked dependencies in addition to copied dependencies. It allows sharing `public` resources and 
`index.html`s among multiple packages.

To provide a linked dependency, add `export` property to the `pcms-node-build`.
It should list provided dependencies in the form
```
"local-dependency-name": ["list", "of", "files", "and", "folders"]
```
For example:
```
"export": {
  "common": ["public", "index.html"]
}
```

To import linked dependency, add `import` property to the dependency descriptor.
It should specify a list of dependencies to link. For example,
```
"dependencies": {
  "parent-package": {
    "import": "common"
  }
}
```

## Command line support
Run `npm install -g @pcms/pcms-node-build` to install `pcms-node-build` script or add it
to `devDependencies` of a package. 
Then run `pcms-node-build update` to update local dependencies.

It is possible to use `pcms-node-build` script in the `scripts` section of `package.json`.
For example, you may alter your build script to 
```
npx pcms-node-build update && old-build-script
```
This ensures that each time the newest versions of the dependencies are used.