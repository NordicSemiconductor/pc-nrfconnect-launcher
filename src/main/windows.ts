/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    app as electronApp,
    BrowserWindow,
    Rectangle,
    screen,
    WebContents,
} from 'electron';
import path from 'path';

import { AppDetails } from '../ipc/appDetails';
import { InstalledDownloadableApp, LaunchableApp } from '../ipc/apps';
import { registerLauncherWindowFromMain as registerLauncherWindow } from '../ipc/sendToLauncherWindow';
import * as apps from './apps';
import * as browser from './browser';
import * as config from './config';
import * as settings from './settings';

let launcherWindow: BrowserWindow | undefined;
const appWindows: {
    browserWindow: BrowserWindow;
    app: LaunchableApp;
}[] = [];

const getDefaultIconPath = () =>
    path.join(
        config.getElectronResourcesDir(),
        process.platform === 'win32' ? 'icon.ico' : 'icon.png'
    );

export const openLauncherWindow = () => {
    if (launcherWindow) {
        launcherWindow.show();
    } else {
        launcherWindow = browser.createWindow({
            title: `nRF Connect for Desktop v${config.getVersion()}`,
            url: `file://${config.getElectronResourcesDir()}/launcher.html`,
            icon: getDefaultIconPath(),
            width: 760,
            height: 600,
            center: true,
            splashScreen: !config.isSkipSplashScreen(),
        });

        registerLauncherWindow(launcherWindow);

        launcherWindow.on('close', event => {
            if (appWindows.length > 0) {
                event.preventDefault();
                launcherWindow?.hide();
            }
        });
    }
};

export const hideLauncherWindow = () => {
    launcherWindow?.hide();
};

const defaultWindowSize = {
    width: 1024,
    height: 800,
    maximized: false,
};

interface WindowState {
    x?: number;
    y?: number;
    width: number;
    height: number;
    maximized: boolean;
}

export const openAppWindow = (app: LaunchableApp) => {
    const lastWindowState = settings.get(
        'lastWindowState',
        defaultWindowSize
    ) as WindowState;

    let { x, y } = lastWindowState;
    const { width, height } = lastWindowState;

    if (x && y) {
        const { bounds } = screen.getDisplayMatching(
            lastWindowState as Rectangle
        );
        const left = Math.max(x, bounds.x);
        const top = Math.max(y, bounds.y);
        const right = Math.min(x + width, bounds.x + bounds.width);
        const bottom = Math.min(y + height, bounds.y + bounds.height);
        if (left > right || top > bottom) {
            // the window would be off screen, let's open it where the launcher is
            x = undefined;
            y = undefined;
        }
    }

    const appWindow = browser.createWindow({
        title: `${app.displayName || app.name} v${app.currentVersion}`,
        url: `file://${config.getElectronResourcesDir()}/app.html?appPath=${
            app.path
        }`,
        icon: app.iconPath ? app.iconPath : getDefaultIconPath(),
        x,
        y,
        width,
        height,
        minHeight: 500,
        minWidth: 760,
        show: true,
        backgroundColor: '#fff',
    });

    appWindows.push({
        browserWindow: appWindow,
        app,
    });

    appWindow.webContents.on('did-finish-load', () => {
        if (lastWindowState.maximized) {
            appWindow.maximize();
        }
    });

    appWindow.on('close', () => {
        const bounds = appWindow.getBounds();
        settings.set('lastWindowState', {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            maximized: appWindow.isMaximized(),
        });
    });

    appWindow.on('closed', () => {
        const index = appWindows.findIndex(
            appWin => appWin.browserWindow === appWindow
        );
        if (index > -1) {
            appWindows.splice(index, 1);
        }
        if (
            appWindows.length === 0 &&
            !(launcherWindow && launcherWindow.isVisible())
        ) {
            electronApp.quit();
        }
    });
};

export const openOfficialAppWindow = (appName: string, sourceName: string) =>
    apps.getDownloadableApps().then(({ apps: appList }) => {
        const officialApp = appList.find(
            app => app.name === appName && app.source === sourceName
        );
        const isInstalled =
            officialApp && (officialApp as InstalledDownloadableApp).path;

        if (isInstalled) {
            openAppWindow(officialApp as InstalledDownloadableApp);
        } else {
            throw new Error(
                `Tried to open app ${appName} from source ${sourceName}, but it is not installed`
            );
        }
    });

export const openLocalAppWindow = (appName: string) =>
    apps.getLocalApps().then(appList => {
        const localApp = appList.find(app => app.name === appName);
        if (localApp) {
            openAppWindow(localApp);
        } else {
            throw new Error(
                `Tried to open local app ${appName}, but it is not installed`
            );
        }
    });

const getAppWindow = (sender: WebContents) => {
    const parentWindow = BrowserWindow.fromWebContents(sender);
    return appWindows.find(appWin => appWin.browserWindow === parentWindow);
};

export const getAppDetails = (webContents: WebContents): AppDetails => {
    const appWindow = getAppWindow(webContents);

    if (appWindow == null) {
        throw new Error(
            `No app window found for webContents '${webContents.getTitle()}' ${webContents.getURL()}`
        );
    }

    return {
        coreVersion: config.getVersion(),
        corePath: config.getElectronRootPath(),
        homeDir: config.getHomeDir(),
        tmpDir: config.getTmpDir(),
        bundledJlink: config.getBundledJlinkVersion(),
        ...appWindow.app,
    };
};