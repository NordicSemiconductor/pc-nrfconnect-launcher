/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { registerGetAppDetails } from '../ipc/appDetails';
import {
    registerDownloadAllAppsJsonFiles,
    registerDownloadReleaseNotes,
    registerGetDownloadableApps,
    registerGetLocalApps,
    registerInstallDownloadableApp,
    registerRemoveDownloadableApp,
} from '../ipc/apps';
import { registerCreateDesktopShortcut } from '../ipc/createDesktopShortcut';
import { registerDownloadToFile } from '../ipc/downloadToFile';
import {
    registerCancelUpdate,
    registerCheckForUpdate,
    registerStartUpdate,
} from '../ipc/launcherUpdate';
import { registerOpenApp, registerOpenLauncher } from '../ipc/openWindow';
import {
    registerEndPreventingSleep,
    registerStartPreventingSleep,
} from '../ipc/preventSleep';
import { registerAnswerProxyLoginRequest } from '../ipc/proxyLogin';
import { registerGetSetting, registerSetSetting } from '../ipc/settings';
import {
    registerAddSource,
    registerGetSources,
    registerRemoveSource,
} from '../ipc/sources';
import {
    downloadAllAppsJsonFiles,
    downloadReleaseNotes,
    getDownloadableApps,
    getLocalApps,
    installDownloadableApp,
    removeDownloadableApp,
} from './apps';
import { cancelUpdate, checkForUpdate, startUpdate } from './autoUpdate';
import createDesktopShortcut from './createDesktopShortcut';
import { downloadToFile } from './net';
import { callRegisteredCallback } from './proxyLogins';
import { get as getSetting, set as setSetting } from './settings';
import { addSource, getAllSources, removeSource } from './sources';
import { getAppDetails, openAppWindow, openLauncherWindow } from './windows';

export default () => {
    registerGetAppDetails(getAppDetails);

    registerDownloadToFile(downloadToFile);

    registerCreateDesktopShortcut(createDesktopShortcut);

    registerGetSetting(getSetting);
    registerSetSetting(setSetting);

    registerEndPreventingSleep();
    registerStartPreventingSleep();

    registerAnswerProxyLoginRequest(callRegisteredCallback);

    registerCheckForUpdate(checkForUpdate);
    registerStartUpdate(startUpdate);
    registerCancelUpdate(cancelUpdate);

    registerOpenApp(openAppWindow);
    registerOpenLauncher(openLauncherWindow);

    registerDownloadAllAppsJsonFiles(downloadAllAppsJsonFiles);
    registerDownloadReleaseNotes(downloadReleaseNotes);
    registerGetDownloadableApps(getDownloadableApps);
    registerGetLocalApps(getLocalApps);
    registerInstallDownloadableApp(installDownloadableApp);
    registerRemoveDownloadableApp(removeDownloadableApp);

    registerGetSources(getAllSources);
    registerAddSource(addSource);
    registerRemoveSource(removeSource);
};
