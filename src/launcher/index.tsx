/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'regenerator-runtime/runtime';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { getSettings } from '../ipc/settings';
import {
    loadDownloadableApps,
    loadLocalApps,
} from './features/apps/appsEffects';
import { initializeFilters } from './features/filter/filterEffects';
import {
    checkForCoreUpdatesAtStartup,
    downloadLatestAppInfoAtStartup,
} from './features/launcherUpdate/launcherUpdateEffects';
import { setCheckUpdatesAtStartup } from './features/settings/settingsSlice';
import { loadSources } from './features/sources/sourcesEffects';
import {
    checkUsageDataSetting,
    sendEnvInfo,
} from './features/usageData/usageDataEffects';
import Root from './Root';
import store from './store';
import registerIpcHandler from './util/registerIpcHandler';

import '../../resources/css/launcher.scss';

const { dispatch } = store;
registerIpcHandler(dispatch);

const rootElement = (
    <Provider store={store}>
        <Root />
    </Provider>
);

render(rootElement, document.getElementById('webapp'), async () => {
    dispatch(checkUsageDataSetting());

    const settings = await getSettings();
    const { shouldCheckForUpdatesAtStartup } = settings;
    dispatch(setCheckUpdatesAtStartup(shouldCheckForUpdatesAtStartup));
    dispatch(initializeFilters(settings));

    await dispatch(loadSources());

    await dispatch(loadLocalApps());
    await dispatch(loadDownloadableApps());

    dispatch(downloadLatestAppInfoAtStartup(shouldCheckForUpdatesAtStartup));
    dispatch(checkForCoreUpdatesAtStartup(shouldCheckForUpdatesAtStartup));
    sendEnvInfo();
});
