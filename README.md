# Standard Gulp Deploy Setup

This is a standard setup for Gulp deploys that I may use for a project.

The aim is convenience of development/deployment and attempting to make the site run as fast as possible once it's deployed.

run `npm install` to get started

`gulp styles`
minifies and combines your .scss files, then converts them to .css (for use on projects that don't support .scss)

`gulp scripts`
minifies and combines your .js files

`gulp images`
optimizes your images for the web

`gulp deploy`
deploys your project to the server, using SSH credentials -- also runs `gulp styles` and `gulp scripts` before deploying

`gulp watch`
starts BrowserSync and declares directories where BrowserSync should reload if a change is made