const electron = require('electron');
const settings = require('./settings');
const menu = require('./menu');

function createSplashScreen() {
    let splashScreen = new electron.BrowserWindow({
        width: 400,
        height: 223,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        transparent: true
    });
    splashScreen.loadURL('file://' + __dirname + '/../resources/splashScreen.html');
    splashScreen.on('closed', function () {
        splashScreen = null;
    });
    splashScreen.show();
    return splashScreen;
}

function createWindow(options) {
    const lastWindowState = settings.loadLastWindow();
    const mergedOptions = Object.assign({
        x: lastWindowState.x,
        y: lastWindowState.y,
        width: lastWindowState.width,
        height: lastWindowState.height,
        minWidth: 308,
        minHeight: 499,
        show: false,
        autoHideMenuBar: true,
    }, options);
    let browserWindow = new electron.BrowserWindow(mergedOptions);

    let splashScreen;
    if (options.splashScreen) {
        splashScreen = createSplashScreen();
    }

    browserWindow.loadURL(options.url);

    browserWindow.on('close', function () {
        if (options.keepWindowSettings !== false) {
            settings.storeLastWindow(browserWindow);
        }
    });

    browserWindow.on('closed', function () {
        browserWindow = null;
    });

    browserWindow.webContents.on('did-finish-load', function () {
        if (splashScreen && !splashScreen.isDestroyed()) {
            splashScreen.close();
        }

        if (lastWindowState.maximized) {
            browserWindow.maximize();
        }

        let title = options.title || 'nRF Connect';
        browserWindow.setTitle(title);
        browserWindow.show();
    });

    return browserWindow;
}

module.exports = {
    createWindow: createWindow
};
