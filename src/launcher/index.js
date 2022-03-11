/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'regenerator-runtime/runtime';

import React from 'react';
import { render } from 'react-dom';
import { require as remoteRequire } from '@electron/remote';
import { ipcRenderer } from 'electron';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import * as AppsActions from './actions/appsActions';
import * as AutoUpdateActions from './actions/autoUpdateActions';
import * as ProxyActions from './actions/proxyActions';
import * as UsageDataActions from './actions/usageDataActions';
import RootContainer from './containers/RootContainer';
import rootReducer from './reducers';

import '../../resources/css/launcher.scss';

const config = remoteRequire('../main/config');
const settings = remoteRequire('../main/settings');
const net = remoteRequire('../main/net');

const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk))
);

ipcRenderer.on('progress-update', (event, message) => {
    store.dispatch({ type: AppsActions.UPDATE_DOWNLOAD_PROGRESS, ...message });
});

const rootElement = React.createElement(RootContainer, { store });

const shouldCheckForUpdatesAtStartup = settings.get(
    'shouldCheckForUpdatesAtStartup'
);

function downloadLatestAppInfo() {
    if (
        shouldCheckForUpdatesAtStartup !== false &&
        !config.isSkipUpdateApps()
    ) {
        return store.dispatch(AutoUpdateActions.downloadLatestAppInfo());
    }
    return Promise.resolve();
}

function checkForCoreUpdates() {
    if (
        shouldCheckForUpdatesAtStartup !== false &&
        !config.isSkipUpdateCore() &&
        process.env.NODE_ENV !== 'development'
    ) {
        return store.dispatch(AutoUpdateActions.checkForCoreUpdates());
    }
    return Promise.resolve();
}

net.registerProxyLoginHandler((authInfo, callback) => {
    store.dispatch(ProxyActions.authenticate(authInfo)).then(credentials => {
        const { username, password } = credentials;
        return callback(username, password);
    });
});

render(rootElement, document.getElementById('webapp'), async () => {
    await store.dispatch(UsageDataActions.checkUsageDataSetting());
    await store.dispatch(AppsActions.setAppManagementFilter());
    await store.dispatch(AppsActions.loadLocalApps());
    await store.dispatch(AppsActions.loadOfficialApps());
    await store.dispatch(AppsActions.setAppManagementShow());
    await store.dispatch(AppsActions.setAppManagementSource());
    await downloadLatestAppInfo();
    await checkForCoreUpdates();
    UsageDataActions.sendEnvInfo();
});
