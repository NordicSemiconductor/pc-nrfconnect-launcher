/* Copyright (c) 2015 - 2019, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

const electron = require('electron');
const config = require('./config');

function createSplashScreen() {
    let splashScreen = new electron.BrowserWindow({
        width: 400,
        height: 223,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        transparent: true,
    });
    splashScreen.loadURL(
        `file://${config.getElectronResourcesDir()}/splashscreen.html`
    );
    splashScreen.on('closed', () => {
        splashScreen = null;
    });
    splashScreen.show();
    return splashScreen;
}

function createWindow(options) {
    const mergedOptions = {
        minWidth: 308,
        minHeight: 499,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
        },
        ...options,
    };
    const browserWindow = new electron.BrowserWindow(mergedOptions);

    let splashScreen;
    if (options.splashScreen) {
        splashScreen = createSplashScreen();
    }

    browserWindow.loadURL(options.url);

    // Never navigate away from the given url, e.g. when the
    // user drags and drops a file into the browser window.
    browserWindow.webContents.on('will-navigate', event => {
        event.preventDefault();
    });

    // Open target=_blank link in default browser instead of a
    // new electron window.
    browserWindow.webContents.on('new-window', (event, url) => {
        electron.shell.openExternal(url);
        event.preventDefault();
    });

    browserWindow.webContents.on('did-finish-load', () => {
        if (splashScreen && !splashScreen.isDestroyed()) {
            splashScreen.close();
        }
        const title = options.title || 'nRF Connect';
        browserWindow.setTitle(title);
        browserWindow.show();
    });

    return browserWindow;
}

module.exports = {
    createWindow,
};
