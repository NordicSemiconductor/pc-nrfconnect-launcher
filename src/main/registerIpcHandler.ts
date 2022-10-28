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
    registerInstallLocalApp,
    registerRemoveDownloadableApp,
    registerRemoveLocalApp,
} from '../ipc/apps';
import { registerGetConfig } from '../ipc/config';
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
import { registerRequire } from '../ipc/require';
import {
    registerGetSettings,
    registerHideSource,
    registerResetSettings,
    registerSetCheckUpdatesAtStartup,
    registerSetNameFilter,
    registerSetShownStates,
    registerShowSource,
} from '../ipc/settings';
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
    installLocalApp,
    removeDownloadableApp,
    removeLocalApp,
} from './apps';
import { getConfig } from './config';
import createDesktopShortcut from './createDesktopShortcut';
import { cancelUpdate, checkForUpdate, startUpdate } from './launcherUpdate';
import { downloadToFile } from './net';
import { callRegisteredCallback } from './proxyLogins';
import { requireModule } from './require';
import {
    addShownSource,
    get as getSettings,
    removeShownSource,
    resetSettings,
    setCheckUpdatesAtStartup,
    setNameFilter,
    setShownStates,
} from './settings';
import { addSource, getAllSources, removeSource } from './sources';
import { getAppDetails, openAppWindow, openLauncherWindow } from './windows';

export default () => {
    registerGetAppDetails(getAppDetails);

    registerDownloadToFile(downloadToFile);

    registerGetConfig(getConfig);

    registerCreateDesktopShortcut(createDesktopShortcut);

    registerResetSettings(resetSettings);
    registerGetSettings(getSettings);
    registerShowSource(addShownSource);
    registerHideSource(removeShownSource);
    registerSetNameFilter(setNameFilter);
    registerSetShownStates(setShownStates);
    registerSetCheckUpdatesAtStartup(setCheckUpdatesAtStartup);

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
    registerInstallLocalApp(installLocalApp);
    registerRemoveLocalApp(removeLocalApp);
    registerRemoveDownloadableApp(removeDownloadableApp);

    registerGetSources(getAllSources);
    registerAddSource(addSource);
    registerRemoveSource(removeSource);

    registerRequire(requireModule);
};
