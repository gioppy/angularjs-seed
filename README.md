# Angularjs 1.x Seed Project
Seed repository for AngularJS 1.x projects, used on my courses and on my real projects of AngularJS 1.x.

## Installation and Usage
### Step 1: install Node and npm
Before using this project, you must install NodeJS (>= 4.4.5) and npm. You can download the package from [NodeJS website](https://nodejs.org/en/).
### Step 2: install dependencies
You must install two npm modules globally, `gulp` and `bower`:
```
  sudo npm install -g gulp bower
```
Optionally, you can install even a third module globally, `lite-server`:
```
  sudo npm install -g lite-server
```
but is not required.
Remeber to use `sudo` only if you are on UNIX system!
### Step 3: install local dependencies
Download this repository as package or cloning via git.
After that, move to the folder via terminal:
```
  cd path/to/folder
```
and install all the local dependencies:
```
  npm install
```
Note the sudo is not required for local packages. However, if you have permession errors, you can use `sudo` or try to resolve the permission errors.
### Step 4: install libraries
Actually, there is only one library dependency: AngularJS. To install, just type in the terminal:
```
    bower install
```
All the libraries are saved on _assets/libraries_ folder. If you want to change the libraries folder, you must edit the _.bowerrc_ file in the root folder, and change:
```
  {
    "directory": "assets/libraries"
  }
```
### Step 5: environments
There is three main environments: **local**, **dev** and **dist**. To use any of the environments you can be in the root folder on terminal.

**local** is used only on my courses, so you don't really need this!
```
  gulp local
```
**dev** is used for development. In this environment, there is a [lite-server](https://github.com/johnpapa/lite-server) that simulate a real web server. All the compiled files (Javscript and CSS) are automatically saved on _dev_ folder.
```
  gulp dev
```
**Important**: you don't edit or working on any files in this folder. The folder is re-created when you modify or add a file in the working directories.

If you need to remove the _dev_ folder, you can execute on terminal:
```
  gulp dev:clean
```
**dist** is used for final release. This environment create all the necessary files for publishing the app, in the folder _dist_.
```
  gulp dist
```
Before run this task, you must edit the file `configs/dist.json` and add all the necessary files.
The file has 3 main sections:
- **htmlreplace**: this is the name of the replacements in the index.html page. In theory, you don't need to edit this.
- **bundle**: this is a simple list of Javascript and CSS files to combine together, relative to the application itself (basically, _app/_ folder and _assets/_ folder, excluded _assets/libraries/_ folder).
- **vendor**: this is a simple list of Javascript and CSS files to combine together, relative to external libraries (basically, the folder _assets/libraries/_).

For example, if you have this files on your application:
```
  app -
      |- app.module.min.js
      |- app.config.min.js
      |- user -
              |- user.controller.min.js
  assets -
      |- styles -
          |- style.min.css
      |- libraries -
          |- angular.min.js
          |- bootstrap -
              |- bootstrap.min.css
              |- bootstrap.min.js
```
the `dist.json` must be:
```
  {
    "htmlreplace": {
      "cssvendor": "assets/libraries/vendor.min.css",
      "cssbundle": "assets/styles/bundle.min.css",
      "jsbundle": "app/bundle.min.js",
      "jsvendor": "assets/libraries/vendor.min.js"
    },
    "bundle": {
      "css": [
        "assets/styles/style.min.css"
      ],
      "js": [
        "app/app.module.min.js",
        "app/app.config.min.js",
        "app/user/user.controller.min.js"
      ]
    },
    "vendor": {
      "css": [
        "assets/libraries/bootstrap.min.css"
      ],
      "js": [
        "assets/libraries/angular.min.js",
        "assets/libraries/bootstrap.min.js"
      ]
    }
  }
```
**Important**: the order of the files is very important! If you declare a module before the inclusion of the Angular library you can get an error.

This generat 4 files:
- **assets/libraries/vendor.min.css**: this contain all the CSS from external (vendor) libraries;
- **assets/libraries/vendor.min.js**: this contain all the javascripts from (external) vendor libraries;
- **assets/styles/bundle.min.css**: this contain all CSS from the app (bundle);
- **app/bundle.min.js**: this contain all the javascript from the app (bundle).

**Important**: you don't edit or working on any files in this folder. The folder is re-created when build your app.

If you need to remove the _dist_ folder, you can execute on terminal:
```
  gulp dist:clean
```
### Optional: JSON server
If you want to work with a fake JSON Api, you can use [JSON Server](https://github.com/typicode/json-server). The seed is just configured for using json-server: you must install the package globally
```
  npm install -g json-server
```
and add your data in `json-server/db.json`. The server works with a simple JSON file, so you can test/mock your data easily. Please, refer to the json-server documentation on all of the possibilities.

Once you have installed the package, you can start the server with
```
  npm run db
```
The server run on localhost, on port 3002.
## TODO
- [ ] Add testing frameworks
- [x] Integrate with [json-server](https://github.com/typicode/json-server) for fake/mock data.