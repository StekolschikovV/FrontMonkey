'use strict';

var pathDir = '';
var chokidar = require('chokidar');
var fs = require('fs');
var p = require('path');
var cmd = require('node-cmd');
var gulp = require('gulp');
var ts = require('gulp-typescript');
var minifyjs = require('gulp-js-minify');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var coffeescript = require('gulp-coffeescript');
var jade = require('jade');
var gulpJade = require('gulp-jade');
var htmlmin = require('gulp-htmlmin');
var babel = require('gulp-babel');
var server = require('gulp-server-livereload');

// Get file dir
$('#urlDir').change(function () {
    pathDir = this.files[0].path;
    $('#urlDirLabel').text(pathDir);
    watch();
    livereload(pathDir)
});

// Watch dir
function watch() {
    var watcher = chokidar.watch(pathDir, { ignored: /^\./, persistent: true });
    watcher.on('change', function (path) {
        preprocessors(p.basename(path), p.extname(p.basename(path)), path, path.replace(p.basename(path), ''));
    });
};

// Preprocessors
function preprocessors(filename, extname, path, dir) {
    console.log(filename, extname, path, dir);
    if (extname == ".css") {
        gulp.src(path).pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false })).pipe(cssmin()).pipe(gulp.dest(dir));
    } else if (extname == ".sass") {
        cmd.run('sass ' + path + '>' + dir + filename.replace(extname, '') + '.css', function () {
            setTimeout(function () {
                preprocessors(filename.replace(extname, '') + '.css', '.css', dir + filename, dir);
            }, 0);
        });
    } else if (extname == ".ts") {
        gulp.src(path).pipe(ts({ noImplicitAny: true })).pipe(gulp.dest(dir));
    } else if (extname == ".coffee") {
        gulp.src(path).pipe(coffeescript({ bare: true })).pipe(gulp.dest(dir));
    } else if (extname == ".jade") {
        gulp.src(path).pipe(gulpJade({ jade: jade, pretty: true })).pipe(htmlmin({ collapseWhitespace: true })).pipe(gulp.dest(dir));
    } else if (extname == ".js") {
        gulp.src(path).pipe(babel({
            presets: ['es2015']
        })).pipe(gulp.dest(dir));
    }
}

// Livereload
function livereload(pathDir){
    gulp.src(pathDir)
        .pipe(server({
            livereload: true,
            directoryListing: true,
            open: true
        }));
}

//
// $(document).ready(function () {
//     $('img').attr({
//         "ondrag": "return false",
//         "ondragdrop": "return false",
//         "ondragstart": "return false"
//     })
// });