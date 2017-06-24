var electron = require('electron');
var ipcMain = electron.ipcMain;
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

app.on('ready', () => {
    appWindow = new BrowserWindow({
        width: 600,
        height: 400,
        icon: __dirname + '/icon.png'
    });
    appWindow.loadURL(`file://${__dirname}/index.html`);
    appWindow.webContents.openDevTools();
});
app.on('window-all-closed', function() {
    app.quit();
});

//     // ipcMain.on('asynchronous-message', (event, arg) => {
//     // console.log(arg)  // prints "ping"
//     // event.sender.send('asynchronous-reply', 'pong')
//     // })

//     // ipcMain.on('synchronous-message', (event, arg) => {
//     // console.log(arg)  // prints "ping"
//     // event.returnValue = 'pong'
//     // })


//     ipcMain.on('asynchronous-message', (event, arg) => {
//     console.log(arg)  // prints "ping"
//     console.log(arg[1])  // prints "ping"

//     })