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
//var coffeescript = require('gulp-coffeescript');
var jade = require('jade');
var gulpJade = require('gulp-jade');
var htmlmin = require('gulp-htmlmin');
// var babel = require('gulp-babel');
var server = require('gulp-server-livereload');
var jsonfile = require('jsonfile');

var confJson = {};
var conf = {
    // VARS
    // START
    start: function start() {
        conf.checkConfFile();
    },
    // EVENTS
    // METHODS
    checkConfFile: function checkConfFile() {
        fs.exists('./conf.json', function (exists) {
            if (!exists) fs.appendFile('./conf.json', '{"url":[]}', function () {});
            else {
                jsonfile.readFile('./conf.json', function (err, obj) {
                    confJson = obj;
                    $('.urlDirs').remove();
                    if (confJson.url.length > 0) content.addUrlDir();
                });
            }
        });

    }, addUrl: function addUrl(url) {
        if(confJson.url.indexOf(url) == -1) {
            confJson.url.push(url);
            jsonfile.writeFile('./conf.json', confJson, function (err) {});
            conf.saveObjToJson();
            conf.start();
        }
    }, saveObjToJson: function saveObjToJson() {
        jsonfile.writeFile('./conf.json', confJson, function (err) {});
    }, removeUrl: function () {
        console.log('removeUrl', content.selectedWrapNow)
        var urlDir = $( '.urlDirs.selected' ).data( 'url' );
        confJson.url = confJson.url.filter(function(elem){
            return elem != urlDir;
        });
        conf.saveObjToJson();
        conf.checkConfFile();
    }
};

var content = {
    // VARS
    selectedWrapNow: '',
    // START
    start: function start() {
        content.events();
    },
    // EVENTS
    events: function events() {
        console.log('content events');
        $(document).on('change', '#addNewDirInput', function () {
            var pathDir = this.files[0].path;
            conf.addUrl(pathDir);
        });
        $(document).on('click', '#manu-left li', function () {
            content.addClassSelectedToIcon(this);
            content.addClassSelectedToWrap(this);
        });
        $(document).on('click', '.urlDirs', function () {
            content.clearLogNameUrl();
            content.removeClassSelectedToWrap();
            content.removeClassSelectedDir();
            content.addClassSelectedDir(this);
            content.rightSetTitleAndUrl(this);
        });
        $(document).on('click', '#removeUsedDir', function () {
            console.log('click #removeUsedDir');
            content.removeSelectedDir();
        });
    },
    // METHODS
    addUrlDir: function addUrlDir() {
        for (var i = 0; i < confJson.url.length; i++) {
            $("#directory ul").prepend('<li data-url="' + confJson.url[i] + '" class="urlDirs"><h4>' + p.basename(confJson.url[i].toString()) + '</h4></li>');
        }
    }, addClassSelectedToIcon: function addClassSelectedToIcon(t) {
        if (!$(t).hasClass('selected')) {
            $('#manu-left li').removeClass('selected');
            $(t).addClass('selected');
        } else $(t).removeClass('selected');
    }, addClassSelectedToWrap: function addClassSelectedToWrap(t) {
        if (content.selectedWrapNow == '') {
            $('#' + $(t).data('page')).addClass('selected');
            content.selectedWrapNow = $(t).data('page');
        } else if (content.selectedWrapNow == $(t).data('page')) {
            content.removeClassSelectedToWrap();
        } else {
            content.removeClassSelectedToWrap();
            setTimeout(function () {
                content.addClassSelectedToWrap(t);
            }, 300);
        }
    }, removeClassSelectedToWrap: function removeClassSelectedToWrap() {
        content.selectedWrapNow = '';
        $('#manu-left-slider > div').removeClass('selected');
    }, removeClassSelectedDir: function removeClassSelectedDir() {
        $('#directory li').removeClass('selected');
    }, addClassSelectedDir: function addClassSelectedDir(t) {
        $(t).addClass('selected');
    }, rightSetTitleAndUrl: function (t) {
        console.log('rightSetTitleAndUrl')
        $('#content-right-url').text($(t).data('url'));
        $('#content-right-name').text(p.basename($(t).data('url').toString()));
    }, addToLog: function (filename, extname, path, dir) {
        $('#log').prepend('<div class="log-mes">' + filename + ' ' + extname + ' ' + path + ' ' + dir + '</div>');
    }, clearLogNameUrl: function () {
        console.log('clearLogNameUrl');
        $('#log').text('Log empty');
        $('#content-right-url').text('Not select');
        $('#content-right-name').text('Not select');
    }, removeSelectedDir: function () {
        console.log('removeUrl');
        conf.removeUrl();
    }
};

var preproc = {
    // VARS
    dir: '',
    watcher: '',
    livereloadStartTF: '',
    port: 80,
    stream:'',
    // START
    start: function start() {
        preproc.events();
    },
    // EVENTS
    events: function events(t) {
        $(document).on('click', 'li.urlDirs', function () {
            preproc.selectDir(this);
            if (preproc.watcher) preproc.watcher.close();
            preproc.watch();
        });
        $(document).on('change', '#addNewDirInput', function () {
            pathDir = this.files[0].path;
            $('#livereloadDirLabel h4').text(p.basename(pathDir.toString()));
            $('#livereloadDirLabel h4').data('url', pathDir);
        });
        $(document).on('click', '#livereloadStart', function () {
            preproc.livereloadStart();
        });
    },
    // METHODS
    selectDir: function selectDir(t) {
        preproc.dir = $(t).data('url');
        console.log('selectDir');
    }, watch: function watch() {
        preproc.watcher = chokidar.watch(preproc.dir, { ignored: /^\./, persistent: true });
        preproc.watcher.unwatch('lib*');
        preproc.watcher.unwatch('.git*');
        preproc.watcher.unwatch('node_modules*');
        preproc.watcher.on('change', function (path) {
            console.log('watch change');
            preproc.preprocessors(p.basename(path), p.extname(p.basename(path)), path, path.replace(p.basename(path), ''));
        });
    }, preprocessors: function preprocessors(filename, extname, path, dir) {
        console.log('preprocessors');
        if (extname == ".css") {
            content.addToLog(filename, extname, path, dir);
            gulp.src(path).pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false })).pipe(cssmin()).pipe(gulp.dest(dir));
        } else if (extname == ".sass") {
            content.addToLog(filename, extname, path, dir);
            cmd.run('sass ' + path + '>' + dir + filename.replace(extname, '') + '.css', function () {
                setTimeout(function () {
                    _preprocessors(filename.replace(extname, '') + '.css', '.css', dir + filename, dir);
                }, 0);
            });
        } else if (extname == ".ts") {
            content.addToLog(filename, extname, path, dir);
            gulp.src(path).pipe(ts({ noImplicitAny: true })).pipe(gulp.dest(dir));
        } else if (extname == ".coffee") {
           // content.addToLog(filename, extname, path, dir);
           // gulp.src(path).pipe(coffeescript({ bare: true })).pipe(gulp.dest(dir));
        } else if (extname == ".jade") {
            content.addToLog(filename, extname, path, dir);
            gulp.src(path).pipe(gulpJade({ jade: jade, pretty: true })).pipe(htmlmin({ collapseWhitespace: true })).pipe(gulp.dest(dir));
        }
    }, livereloadStart: function () {
        var livereloadUrl = $('#livereloadDirLabel h4').data('url');
        console.log('livereloadStart', livereloadUrl);
        if(livereloadUrl) {
            if(preproc.livereloadStartTF != '')
                preproc.stream.emit('kill');
            else
                preproc.livereloadStartTF = true;
            preproc.stream = server({
                livereload: true,
                directoryListing: {
                    enable: true,
                    path: livereloadUrl
                },
                open: true,
                port: 800
            });
            gulp.src(livereloadUrl).pipe(preproc.stream);
        }
    }
};

$(document).ready(function () {
    conf.start();
    content.start();
    preproc.start();
});


// TODO: Ливрелоад, почему запускаеть при страте не та папка?
// OK: Не добавлять в конф двойные элементы
// TODO: Ливрелоад и Препроц, где ошибка и при каком порядке?
// OK: Конфиг при старте - ошибка
// TODO: Uncaught Error: EPERM: operation not permitted, write
// TODO:
// TODO:



