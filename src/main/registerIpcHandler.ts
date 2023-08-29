/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    appDetails,
    openWindow,
    preventSleep,
    safeStorage,
    serialPort,
} from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import {
    app,
    powerSaveBlocker,
    safeStorage as safeStorageElectron,
} from 'electron';
import Store from 'electron-store';
import fs from 'fs';
import path from 'path';

import packageJson from '../../package.json';
import * as apps from '../ipc/apps';
import * as config from '../ipc/config';
import * as desktopShortcut from '../ipc/createDesktopShortcut';
import * as launcherUpdate from '../ipc/launcherUpdate';
import * as proxyLogin from '../ipc/proxyLogin';
import * as sources from '../ipc/sources';
import {
    installDownloadableApp,
    installLocalApp,
    removeDownloadableApp,
    removeLocalApp,
} from './apps/appChanges';
import {
    downloadLatestAppInfos,
    getDownloadableApps,
    getLocalApps,
} from './apps/apps';
import createDesktopShortcut from './apps/createDesktopShortcut';
import { addSource, removeSource } from './apps/sourceChanges';
import { getAllSources } from './apps/sources';
import argv from './argv';
import { cancelUpdate, checkForUpdate, startUpdate } from './launcherUpdate';
import { callRegisteredCallback } from './proxyLogins';
import {
    closeSerialPort,
    getOptions,
    isOpen,
    openOrAdd,
    set,
    update,
    writeToSerialport,
} from './serialport';
import { getAppDetails, openApp, openLauncherWindow } from './windows';

const getConfigForRenderer = () => ({
    isRunningLauncherFromSource: fs.existsSync(
        path.join(app.getAppPath(), 'README.md')
    ),
    isSkipUpdateApps: argv['skip-update-apps'],
    isSkipUpdateLauncher: argv['skip-update-launcher'],
    version: packageJson.version,
});

const startPreventingSleep = () =>
    powerSaveBlocker.start('prevent-app-suspension');
const endPreventingSleep = (id: number) => powerSaveBlocker.stop(id);

export default () => {
    Store.initRenderer();

    appDetails.forRenderer.registerGetAppDetails(getAppDetails);

    config.forRenderer.registerGetConfig(getConfigForRenderer());

    desktopShortcut.forRenderer.registerCreateDesktopShortcut(
        createDesktopShortcut
    );

    preventSleep.forRenderer.registerStart(startPreventingSleep);
    preventSleep.forRenderer.registerEnd(endPreventingSleep);

    safeStorage.forRenderer.registerEncryptionAvailable(
        safeStorageElectron.isEncryptionAvailable
    );
    safeStorage.forRenderer.registerDecryptString(encryptString =>
        safeStorageElectron.decryptString(Buffer.from(encryptString))
    );
    safeStorage.forRenderer.registerEncryptString(plainText =>
        safeStorageElectron.encryptString(plainText).toString()
    );

    proxyLogin.forRenderer.registerAnswerProxyLoginRequest(
        callRegisteredCallback
    );

    launcherUpdate.forRenderer.registerCheckForUpdate(checkForUpdate);
    launcherUpdate.forRenderer.registerStartUpdate(startUpdate);
    launcherUpdate.forRenderer.registerCancelUpdate(cancelUpdate);

    openWindow.forRenderer.registerOpenApp(openApp);
    openWindow.forRenderer.registerOpenLauncher(openLauncherWindow);

    apps.forRenderer.registerDownloadLatestAppInfos(downloadLatestAppInfos);
    apps.forRenderer.registerGetLocalApps(getLocalApps);
    apps.forRenderer.registerInstallLocalApp(installLocalApp);
    apps.forRenderer.registerRemoveLocalApp(removeLocalApp);
    apps.forRenderer.registerRemoveDownloadableApp(removeDownloadableApp);
    apps.forRenderer.registerGetDownloadableApps(getDownloadableApps);
    apps.forRenderer.registerInstallDownloadableApp(installDownloadableApp);

    sources.forRenderer.registerGetSources(getAllSources);
    sources.forRenderer.registerAddSource(addSource);
    sources.forRenderer.registerRemoveSource(removeSource);

    serialPort.forRenderer.registerOpen(openOrAdd);
    serialPort.forRenderer.registerClose(closeSerialPort);
    serialPort.forRenderer.registerWrite(writeToSerialport);
    serialPort.forRenderer.registerIsOpen(isOpen);
    serialPort.forRenderer.registerGetOptions(getOptions);
    serialPort.forRenderer.registerUpdate(update);
    serialPort.forRenderer.registerSet(set);
};
