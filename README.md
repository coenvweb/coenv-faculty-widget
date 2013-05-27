# elcontraption-starter
Author: Darin Reid / elegant contraption

http://elcontraption.com/
* * *

My personal web starter project.

## Goals
1. Front end development workflow should be fun.
1. Should be able to hit the ground running.
1. Javascript and CSS assets should be modular.
1. Production code and assets should be optimized for speed.

## Requirements
* Git
* Bower
* Node/Grunt
* Compass
* Livereload browser extensions

## Instructions
Clone locally or download zip file.
```
$ git clone https://github.com/elcontraption/elcontraption-starter.git
$ mv elcontraption-starter projectname && cd projectname
```

Install project dependencies.
```
$ bower install
$ npm install
```

Run default Grunt tasks.
```
$ grunt
```

Run default Grunt tasks and set up a livereload server.
```
$ grunt server
```

Enable the livereload browser extension to see live changes.

## Structure
* /assets
    * /fonts: font and icon files
    * /img
    * /scripts
        * /build: production javascript
        * /src: development javascript
    * /styles
        * /build: production css
        * /src: development scss
* .htaccess
* .jshintrc: jshint config
* bower.json: Bower dependencies
* Gruntfile.js: Grunt config
* index.html
* package.json: NPM dependencies
* README.md