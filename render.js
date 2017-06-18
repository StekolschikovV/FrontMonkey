var pathDir = '';
var chokidar = require('chokidar');
var fs = require('fs');

var cmd=require('node-cmd');

// Get file dir
$('#urlDir').change(function () {
    pathDir = this.files[0].path;
    $('#urlDirLabel').text(pathDir);
    watch();
});

// Watch dir
function watch() {
    fs.watch(pathDir, (eventType, filename) => {
        if (filename)
            preprocessors(filename);
})};

// Preprocessors
function preprocessors(filename) {
    if(filename.substr(filename.length-5,5).toLowerCase() == '.sass') {
        var str = 'npm-sass ' + pathDir + '\\' + filename + ' > ' + pathDir + '\\' +  filename.substring(0, filename.length - 5) + '.css';
        str = str.replace(/\\/g, "/");
        cmd.run(str);
    }
    else if(filename.substr(filename.length-5,5).toLowerCase() == '.jade') {
        var str = 'jade ' + pathDir + '\\' + filename;
        str = str.replace(/\\/g, "/");
        cmd.run(str);
    } else if(filename.substr(filename.length-7,7).toLowerCase() == '.coffee'){
        var str = 'coffee -c ' + pathDir + '\\' + filename;
        str = str.replace(/\\/g, "/");
        cmd.run(str);
    }
}

//
$( document ).ready(function() {
    $('img').attr({
        "ondrag":"return false",
        "ondragdrop":"return false",
        "ondragstart":"return false"
    })
});