var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

app.on('ready', () => {
    appWindow = new BrowserWindow({
        width: 300,
        height: 300,
        icon: __dirname + '/icon.png'
    });
    appWindow.loadURL(`file://${__dirname}/index.html`);
    appWindow.webContents.openDevTools();
});
app.on('window-all-closed', function() {
    app.quit();
});