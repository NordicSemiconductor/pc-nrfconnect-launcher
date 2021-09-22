/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Store from 'electron-store';
import path from 'path';

const {
    sendLauncherUsageData,
} = require('../../launcher/actions/usageDataActions');

const store = new Store({ name: 'pc-nrfconnect-launcher' });

const currentAppName = () => {
    const params = new URL(window.location.toString()).searchParams;
    const appPath = params.get('appPath') ?? 'unknown app';

    return path.basename(appPath);
};

const appsWithoutWarningPermanently = [
    'pc-nrfconnect-ble',
    'pc-nrfconnect-gettingstarted',
    'pc-nrfconnect-programmer',
    'pc-nrfconnect-linkmonitor',
    'pc-nrfconnect-tracecollector',
    'pc-nrfconnect-dtm',
];

const appsWithoutWarningLocally = () =>
    store.get('doNotShowLegacyAppDialogAgain', []);

const appsWithoutWarning = appsWithoutWarningPermanently.concat(
    appsWithoutWarningLocally()
);

export const showWarningForCurrentApp = () =>
    !appsWithoutWarning.includes(currentAppName());

export const addToDoNotShowLegacyAppDialogAgain = () => {
    const previousApps = store.get('doNotShowLegacyAppDialogAgain', []);
    store.set('doNotShowLegacyAppDialogAgain', [
        ...previousApps,
        currentAppName(),
    ]);
};

export const sendUsageDataForLegacyApp = () => {
    sendLauncherUsageData('Display legacy app warning', currentAppName());
};
