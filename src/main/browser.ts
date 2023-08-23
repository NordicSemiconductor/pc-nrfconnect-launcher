/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { enable } from '@electron/remote/main';
import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    shell,
} from 'electron';

import { additionalArguments } from './argv';
import { getBundledResourcesDir } from './config';

type BrowserWindowOptions = BrowserWindowConstructorOptions & {
    splashScreen?: boolean;
    url: string;
};

const createSplashScreen = (icon: BrowserWindowOptions['icon']) => {
    let splashScreen: BrowserWindow | null = new BrowserWindow({
        width: 400,
        height: 223,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        transparent: true,
        icon,
    });
    splashScreen.loadURL(
        `file://${getBundledResourcesDir()}/splashscreen.html`
    );
    splashScreen.on('closed', () => {
        splashScreen = null;
    });
    splashScreen.show();
    enable(splashScreen.webContents);

    return splashScreen;
};

const mergeAdditionalArguments = (nonCommandlineArguments: string[]) => {
    if (
        additionalArguments.length === 0 &&
        nonCommandlineArguments.length === 0
    ) {
        return [];
    }

    return ['--', ...nonCommandlineArguments, ...additionalArguments];
};

export const createWindow = (
    options: BrowserWindowOptions,
    nonCommandlineArguments: string[] = []
) => {
    const mergedOptions: BrowserWindowOptions = {
        minWidth: 308,
        minHeight: 499,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            sandbox: false,
            contextIsolation: false,
            additionalArguments: mergeAdditionalArguments(
                nonCommandlineArguments
            ),
            backgroundThrottling: false,
        },
        ...options,
    };
    const browserWindow = new BrowserWindow(mergedOptions);

    let splashScreen: BrowserWindow | null;
    if (options.splashScreen) {
        splashScreen = createSplashScreen(options.icon);
    }

    browserWindow.loadURL(options.url);

    // Never navigate away from the given url, e.g. when the
    // user drags and drops a file into the browser window.
    browserWindow.webContents.on('will-navigate', event => {
        event.preventDefault();
    });

    // Open target=_blank link in default browser instead of a
    // new electron window.
    browserWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    browserWindow.once('ready-to-show', () => {
        browserWindow.show();
        if (splashScreen && !splashScreen.isDestroyed()) {
            splashScreen.close();
        }
    });

    enable(browserWindow.webContents);
    return browserWindow;
};
