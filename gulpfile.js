/**
 * Created by jonfor on 11/24/15.
 */
var browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    concat = require('gulp-concat'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    minifyCss = require('gulp-minify-css'),
    ngAnnotate = require('gulp-ng-annotate'),
    notifier = require('node-notifier'),
    plumber = require('gulp-plumber'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    watchify = require('watchify');

// Define file path variables
var paths = {
    root: 'routes',                     // App root path
    src: 'public/javascripts/',         // Source path
    dist: 'public/javascripts/dist/',   // Distribution path
    test: 'testSpecs/',                 // Test path
    css: 'public/stylesheets/',         // Stylesheets path
    cssDist: 'public/stylesheets/dist'  // Stylesheets dist path
};

var bundler = watchify(browserify({
    entries: paths.src + 'app.js', // Only need initial file, browserify finds the deps
    debug: true // Gives us sourcemapping
}, watchify.args));

gulp.task('browserify', function () {
    bundle();
    bundler.on('update', bundle);

    bundler.on('time', function (time) {
        gutil.log('Browserify', 'rebundling took ', gutil.colors.cyan(time + ' ms'));
    });
});

gulp.task('browserifyProd', function () {
    bundleProd();
    bundler.on('update', bundleProd);

    bundler.on('time', function (time) {
        gutil.log('BrowserifyProd', 'rebundling took ', gutil.colors.cyan(time + ' ms'));
    });
});

gulp.task('browserifyProdOnce', function () {
  bundleProd();

  bundler.on('time', function (time) {
    gutil.log('BrowserifyProd', 'rebundling took ', gutil.colors.cyan(time + ' ms'));
  });
});

//TODO Get this working. Rules seem to cascade incorrectly when concat and minified.
//gulp.task('processStyles', function() {
//    return gulp.src(paths.css + '*.css')
//        .pipe(sourcemaps.init({loadMaps: true}))
//        .pipe(minifyCss())
//        .pipe(sourcemaps.write())
//        .pipe(concat('app.min.css'))
//        .pipe(gulp.dest(paths.cssDist));
//});

function bundle() {
    return bundler.bundle()
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(source('app.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.dist));
}

function bundleProd() {
    return bundler.bundle()
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(ngAnnotate())
        .pipe(uglify({mangle: false}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.dist));
}

function errorHandler(err) {
    notifier.notify({message: 'Error: ' + err.message});
    gutil.log(gutil.colors.red('Error: ' + err.message));
}

gulp.task('default', [], function () {
    gulp.start('browserify');
});
