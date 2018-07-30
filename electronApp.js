// TODO figure out a way to webpack the electron shell.
// Doing that should allow for React JSX techniques to be followed.
const {app, BrowserWindow} = require('electron');


function createWindow () {
    // Create the browser window.
    const win = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    win.loadFile('./dist/index.html');
}

app.on('ready', createWindow);