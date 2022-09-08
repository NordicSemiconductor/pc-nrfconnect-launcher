/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { registerHandlerFromMain as registerAppDetailsHandler } from '../ipc/appDetails';
import {
    registerDownloadAllAppsJsonFilesHandlerFromMain as registerDownloadAllAppsJsonFilesHandler,
    registerDownloadReleaseNotesHandlerFromMain as registerDownloadReleaseNotesHandler,
    registerGetDownloadableAppsHandlerFromMain as registerGetDownloadableAppsHandler,
    registerGetLocalAppsHandlerFromMain as registerGetLocalAppsHandler,
    registerInstallDownloadableAppHandlerFromMain as registerInstallDownloadableAppHandler,
    registerRemoveDownloadableAppHandlerFromMain as registerRemoveDownloadableAppHandler,
} from '../ipc/apps';
import { registerHandlerFromMain as registerCreateDesktopShortcutHandler } from '../ipc/createDesktopShortcut';
import { registerHandlerFromMain as registerDownloadToFileHandler } from '../ipc/downloadToFile';
import {
    registerCancelUpdateHandlerFromMain as registerCancelUpdateHandler,
    registerCheckForUpdateHandlerFromMain as registerCheckForUpdateHandler,
    registerStartUpdateHandlerFromMain as registerStartUpdateHandler,
} from '../ipc/launcherUpdate';
import {
    registerOpenAppHandlerFromMain as registerOpenAppHandler,
    registerOpenLauncherHandlerFromMain as registerOpenLauncherHandler,
} from '../ipc/openWindow';
import {
    registerEndHandlerFromMain as registerEndPreventSleepHandler,
    registerStartHandlerFromMain as registerStartPreventSleepHandler,
} from '../ipc/preventSleep';
import { registerHandlerFromMain as registerProxyLoginCredentialsHandler } from '../ipc/proxyLogin';
import {
    registerGetHandlerFromMain as registerGetSettingHandler,
    registerSetHandlerFromMain as registerSetSettingHandler,
} from '../ipc/settings';
import {
    registerAddHandlerFromMain as registerAddSourceHandler,
    registerGetHandlerFromMain as registerGetSourcesHandler,
    registerRemoveHandlerFromMain as registerRemoveSourceHandler,
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
    registerAppDetailsHandler(getAppDetails);

    registerDownloadToFileHandler(downloadToFile);
    registerCreateDesktopShortcutHandler(createDesktopShortcut);

    registerGetSettingHandler(getSetting);
    registerSetSettingHandler(setSetting);

    registerEndPreventSleepHandler();
    registerStartPreventSleepHandler();

    registerProxyLoginCredentialsHandler(callRegisteredCallback);

    registerCheckForUpdateHandler(checkForUpdate);
    registerStartUpdateHandler(startUpdate);
    registerCancelUpdateHandler(cancelUpdate);

    registerOpenAppHandler(openAppWindow);
    registerOpenLauncherHandler(openLauncherWindow);

    registerDownloadAllAppsJsonFilesHandler(downloadAllAppsJsonFiles);
    registerGetLocalAppsHandler(getLocalApps);
    registerGetDownloadableAppsHandler(getDownloadableApps);
    registerDownloadReleaseNotesHandler(downloadReleaseNotes);
    registerInstallDownloadableAppHandler(installDownloadableApp);
    registerRemoveDownloadableAppHandler(removeDownloadableApp);

    registerGetSourcesHandler(getAllSources);
    registerAddSourceHandler(addSource);
    registerRemoveSourceHandler(removeSource);
};
