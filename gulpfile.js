//Make sure gulp loads all of the required plugins
//located at 'package.json'
var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')({ camelize: true }),
    lr = require('tiny-lr'),
    server = lr()
var rsync = require('rsyncwrapper')
var browserSync = require('browser-sync').create();
var fs = require('fs')

//stylesheet tasks when project doesn't support sass
//--------------------
//takes any .scss files located in '/assets/css/src/', converts
//them to .css, prefixes and minifies the CSS, then combines
//the CSS at '/style.min.css'
//--------------------
//execute with 'gulp styles'

gulp.task('styles', function() {
  return gulp.src('assets/css/src/*.scss')
         .pipe(plugins.rubySass({ style: 'expanded' }))
         .pipe(plugins.autoprefixer('last 2 versions', 'ie 9', 'ios 6', 'android 4'))
         .pipe(gulp.dest('assets/css/build'))
         .pipe(plugins.minifyCss({ keepSpecialComments: 1 }))
         .pipe(plugins.livereload(server))
         .pipe(plugins.concat('style.css'))
         .pipe(plugins.rename({ suffix: '.min' }))
         .pipe(gulp.dest('./'))
         .pipe(browserSync.stream())
         .pipe(plugins.notify({ message: 'Styles task complete' }));
});

//javascript tasks
//---------------------
//takes any .js files located in 'assets/js/src', combines them,
//minifies the javascript, then stores it at '/assets/js/scripts.min.js'
//---------------------
//execute with 'gulp scripts'

gulp.task('scripts', function() {
  return gulp.src(['assets/js/src/*.js'])
         .pipe(plugins.concat('scripts.js'))
         .pipe(gulp.dest('assets/js/build'))
         .pipe(plugins.rename({ suffix: '.min' }))
         .pipe(plugins.uglify())
         .pipe(plugins.livereload(server))
         .pipe(gulp.dest('assets/js'))
         .pipe(browserSync.stream())
         .pipe(plugins.notify({ message: 'Scripts task complete' }));
});

//image tasks
//---------------------
//takes all .png, .jpg, and .gif files located in '/assets/img/'
//and optimizes them for the web
//---------------------
//execute with 'gulp images'

gulp.task('images', function() {
  return gulp.src(['assets/img/*.{png,jpg,gif}'])
         .pipe(plugins.imagemin({ optimizationLevel: 7, progressive: true }))
         .pipe(plugins.livereload(server))
         .pipe(gulp.dest('assets/img'))
         .pipe(browserSync.stream())
         .pipe(plugins.notify({ message: 'Images task complete' }));
});

//deploy
//-----------------------
//take project (minus excluded files/directory) and deploy it to the
//server using SSH credentials
//-----------------------
//execute with 'gulp deploy'

gulp.task('deploy', ['default'], function() {
  rsync({
    ssh: true,
    src: './',
    dest: 'deploy@12.34.567.890:/home/deploy/html',
    port: 1234,
    recursive: true,
    syncDest: true,
    //include 3rd party JS libraries located in '/assets/js/lib'
    include: ['assets/js/lib'],
    //exclude non-minified directories
    exclude: ['assets/css/build', 'assets/css/src', 'node_modules',
              '.git', '.gitignore', '*.swp', '.sass-cache', 'deploy',
              'assets/js/build', 'assets/js/src', 'assets/manifest.json'],
    args: ['--verbose']
  }, function(error, stdout, stderr, cmd) {
      console.log(stdout);
  });
});

//start BrowserSync and "watch" directories for updates
//-----------------
//set directories for BrowserSync to watch and launch BrowserSync
//upon making changes to a file within one of the watched directories,
//BrowserSync will automatically reload with the new changes
//-----------------
//execute with 'gulp watch'

gulp.task( 'watch', function() {
  server.listen(5577, function(err) {
    if( err ) {
      return console.log(err)
    };
    //be sure '/assets/manifest.json' is to configured to whichever port
    //your project is running on
    fs.stat('./assets/manifest.json', function(err, stat) {
      if(err == null) {
        var manifest = require('./assets/manifest.json');
        var config = manifest.config || {};
        browserSync.init({
          files: ['{lib,templates}/**/*.php', '*.php'],
          proxy: config.devUrl,
          snippetOptions: {
            whitelist: ['/wp-admin/admin-ajax.php'],
            blacklist: ['/wp-admin/**']
          }
        });
      }
      else{
        console.log('./assets/manifest.json does not exist. BrowserSync disabled.');
      }
    });
    //declare directories for BrowserSync to watch for
    gulp.watch('assets/css/src/**/*.scss', ['styles']);
    gulp.watch('assets/js/src/**/*.js', ['scripts']);
    gulp.watch('assets/img/**/*', ['images']);
    gulp.watch('./*/**.(php,html)').on('change', browserSync.reload);
  });
});

//set tasks to be executed simultaneously with other tasks when
//the 'default' parameter is provided
gulp.task('default', ['styles', 'scripts']);
