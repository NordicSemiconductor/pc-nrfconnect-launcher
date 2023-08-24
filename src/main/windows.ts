/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    OpenAppOptions,
    registerLauncherWindowFromMain,
} from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import {
    app as electronApp,
    BrowserWindow,
    Rectangle,
    screen,
    WebContents,
} from 'electron';
import { join } from 'path';

import packageJson from '../../package.json';
import { AppSpec, isInstalled, LaunchableApp } from '../ipc/apps';
import { getLastWindowState, setLastWindowState } from '../ipc/persistedStore';
import { LOCAL } from '../ipc/sources';
import { getDownloadableApps, getLocalApps } from './apps/apps';
import { quickstartAppName } from './apps/quickstart';
import argv from './argv';
import { createWindow } from './browser';
import bundledJlinkVersion from './bundledJlinkVersion';
import { getBundledResourcesDir } from './config';
import { getAppIcon, getNrfConnectForDesktopIcon } from './icons';

let launcherWindow: BrowserWindow | undefined;
const appWindows: {
    browserWindow: BrowserWindow;
    app: LaunchableApp;
}[] = [];

export const openLauncherWindow = () => {
    if (launcherWindow) {
        launcherWindow.show();
    } else {
        launcherWindow = createLauncherWindow();
    }
};

const createLauncherWindow = () => {
    const window = createWindow({
        title: `nRF Connect for Desktop v${packageJson.version}`,
        url: `file://${getBundledResourcesDir()}/launcher.html`,
        icon: getNrfConnectForDesktopIcon(),
        width: 760,
        height: 600,
        center: true,
        splashScreen: !argv['skip-splash-screen'],
    });

    registerLauncherWindowFromMain(window);

    window.on('close', event => {
        if (appWindows.length > 0) {
            event.preventDefault();
            window.hide();
        }
    });

    // @ts-expect-error Custom event
    window.on('restart-window', () => window.reload());

    return window;
};

export const hideLauncherWindow = () => {
    launcherWindow?.hide();
};

const getSizeOptions = (app: LaunchableApp) => {
    if (app.name === quickstartAppName) {
        return {
            width: 800,
            height: 550,
            resizable: false,
        };
    }

    const lastWindowState = getLastWindowState();

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

    return {
        x,
        y,
        width,
        height,
        minHeight: 500,
        minWidth: 760,
    };
};

export const openAppWindow = (
    app: LaunchableApp,
    openAppOptions: OpenAppOptions = {}
) => {
    const { device } = openAppOptions;
    const additionalArguments: string[] = [];
    if (device != null) {
        additionalArguments.push('--deviceSerial', device.serialNumber);

        if (device.serialPortPath != null) {
            additionalArguments.push('--comPort', device.serialPortPath);
        }
    }

    const template = app.html
        ? `file://${join(
              app.installed.path,
              app.html
          )}?launcherPath=${encodeURIComponent(electronApp.getAppPath())}`
        : `file://${getBundledResourcesDir()}/app.html?appPath=${encodeURIComponent(
              app.installed.path
          )}`;

    const appWindow = createWindow(
        {
            title: `${app.displayName || app.name} v${app.currentVersion}`,
            url: template,
            icon: getAppIcon(app),
            show: true,
            backgroundColor: '#fff',
            ...getSizeOptions(app),
        },
        additionalArguments
    );

    appWindows.push({
        browserWindow: appWindow,
        app,
    });

    if (app.name !== quickstartAppName) {
        appWindow.webContents.on('did-finish-load', () => {
            if (getLastWindowState().maximized) {
                appWindow.maximize();
            }
        });

        appWindow.on('close', () => {
            const bounds = appWindow.getBounds();
            setLastWindowState({
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
                maximized: appWindow.isMaximized(),
            });
        });
    }

    let reloading = false;

    appWindow.on('closed', () => {
        const index = appWindows.findIndex(
            appWin => appWin.browserWindow === appWindow
        );
        if (index > -1) {
            appWindows.splice(index, 1);
        }
        if (
            appWindows.length === 0 &&
            !launcherWindow?.isVisible() &&
            !reloading
        ) {
            electronApp.quit();
        }
    });

    // @ts-expect-error Custom event
    appWindow.once('restart-window', () => {
        reloading = true;
        appWindow.close();
        appWindow.once('closed', () => {
            openAppWindow(app);
            reloading = false;
        });
    });
};

export const openApp = (app: AppSpec, openAppOptions?: OpenAppOptions) => {
    if (app.source === LOCAL) {
        openLocalAppWindow(app.name, openAppOptions);
    } else {
        openDownloadableAppWindow(app, openAppOptions);
    }
};

export const openDownloadableAppWindow = (
    appSpec: AppSpec,
    openAppOptions?: OpenAppOptions
) => {
    const downloadableApp = getDownloadableApps().apps.find(
        app => app.name === appSpec.name && app.source === appSpec.source
    );

    if (downloadableApp != null && isInstalled(downloadableApp)) {
        openAppWindow(downloadableApp, openAppOptions);
    } else {
        throw new Error(
            `Tried to open app ${appSpec.name} from source ${appSpec.source}, but it is not installed`
        );
    }
};

export const openLocalAppWindow = (
    appName: string,
    openAppOptions?: OpenAppOptions
) => {
    const localApp = getLocalApps(false).find(app => app.name === appName);

    if (localApp) {
        openAppWindow(localApp, openAppOptions);
    } else {
        throw new Error(
            `Tried to open local app ${appName}, but it is not installed`
        );
    }
};

const getAppWindow = (sender: WebContents) => {
    const parentWindow = BrowserWindow.fromWebContents(sender);
    return appWindows.find(appWin => appWin.browserWindow === parentWindow);
};

export const getAppDetails = (webContents: WebContents) => {
    const appWindow = getAppWindow(webContents);

    if (appWindow == null) {
        throw new Error(
            `No app window found for webContents '${webContents.getTitle()}' ${webContents.getURL()}`
        );
    }

    return {
        coreVersion: packageJson.version,
        corePath: electronApp.getAppPath(),
        homeDir: electronApp.getPath('home'),
        tmpDir: electronApp.getPath('temp'),
        bundledJlink: bundledJlinkVersion,
        ...appWindow.app,
        // Remove at some point in the future when all apps are update to at least shared v39
        path: appWindow.app.installed.path,
    };
};
