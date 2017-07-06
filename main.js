var electron = require('electron');
var ipcMain = electron.ipcMain;
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
app.on('ready', function() {
    appWindow = new BrowserWindow({
        width: 600,
        height: 400,
        icon: __dirname + '/icon.png'
    });
    appWindow.loadURL('file://'  + __dirname + '/index.html');
    appWindow.webContents.openDevTools();
});
app.on('window-all-closed', function() {
    app.quit();
});
