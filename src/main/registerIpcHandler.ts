/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Store from 'electron-store';

import { registerGetAppDetails } from '../ipc/appDetails';
import {
    registerDownloadAllAppsJsonFiles,
    registerDownloadAppIcon,
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
    registerClose,
    registerGetOptions,
    registerIsOpen,
    registerOpen,
    registerSet,
    registerUpdate,
    registerWrite,
} from '../ipc/serialport';
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
    downloadAppIcon,
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
import { callRegisteredCallback } from './proxyLogins';
import { requireModule } from './require';
import {
    closeSerialPort,
    getOptions,
    isOpen,
    openOrAdd,
    set,
    update,
    writeToSerialport,
} from './serialport';
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
import { getAppDetails, openApp, openLauncherWindow } from './windows';

export default () => {
    Store.initRenderer();

    registerGetAppDetails(getAppDetails);

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

    registerOpenApp(openApp);
    registerOpenLauncher(openLauncherWindow);

    registerDownloadAllAppsJsonFiles(downloadAllAppsJsonFiles);
    registerDownloadAppIcon(downloadAppIcon);
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

    registerOpen(openOrAdd);
    registerClose(closeSerialPort);
    registerWrite(writeToSerialport);
    registerIsOpen(isOpen);
    registerGetOptions(getOptions);
    registerUpdate(update);
    registerSet(set);
};
