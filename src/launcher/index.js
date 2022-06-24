/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'regenerator-runtime/runtime';

import React from 'react';
import { render } from 'react-dom';
import { require as remoteRequire } from '@electron/remote';
import { ErrorDialogActions } from 'pc-nrfconnect-shared';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import { registerHandlerFromRenderer as registerDownloadProgressHandler } from '../ipc/downloadProgress';
import { registerHandlerFromRenderer as registerShowErrorDialogHandler } from '../ipc/errorDialog';
import * as AppsActions from './actions/appsActions';
import * as AutoUpdateActions from './actions/autoUpdateActions';
import * as ProxyActions from './actions/proxyActions';
import * as UsageDataActions from './actions/usageDataActions';
import RootContainer from './containers/RootContainer';
import rootReducer from './reducers';
import mainConfig from './util/mainConfig';

import '../../resources/css/launcher.scss';

const settings = remoteRequire('../main/settings');
const net = remoteRequire('../main/net');

const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk))
);

registerDownloadProgressHandler(progress => {
    store.dispatch({ type: AppsActions.UPDATE_DOWNLOAD_PROGRESS, ...progress });
});

registerShowErrorDialogHandler(errorMessage => {
    store.dispatch(ErrorDialogActions.showDialog(errorMessage));
});

const rootElement = React.createElement(RootContainer, { store });

const shouldCheckForUpdatesAtStartup = settings.get(
    'shouldCheckForUpdatesAtStartup'
);

function downloadLatestAppInfo() {
    if (
        shouldCheckForUpdatesAtStartup !== false &&
        !mainConfig().isSkipUpdateApps
    ) {
        return store.dispatch(AutoUpdateActions.downloadLatestAppInfo());
    }
    return Promise.resolve();
}

function checkForCoreUpdates() {
    if (
        shouldCheckForUpdatesAtStartup !== false &&
        !mainConfig.isSkipUpdateCore &&
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
