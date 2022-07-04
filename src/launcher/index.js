/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'regenerator-runtime/runtime';

import React from 'react';
import { render } from 'react-dom';
import { ErrorDialogActions } from 'pc-nrfconnect-shared';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import { registerHandlerFromRenderer as registerDownloadProgressHandler } from '../ipc/downloadProgress';
import { registerHandlerFromRenderer as registerShowErrorDialogHandler } from '../ipc/errorDialog';
import { registerHandlerFromRenderer as registerProxyLoginHandler } from '../ipc/proxyLogin';
import { invokeGetFromRenderer as getSetting } from '../ipc/settings';
import * as AppsActions from './actions/appsActions';
import * as AutoUpdateActions from './actions/autoUpdateActions';
import * as ProxyActions from './actions/proxyActions';
import * as UsageDataActions from './actions/usageDataActions';
import RootContainer from './containers/RootContainer';
import rootReducer from './reducers';
import mainConfig from './util/mainConfig';

import '../../resources/css/launcher.scss';

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

registerProxyLoginHandler((requestId, authInfo) => {
    store.dispatch(ProxyActions.authenticate(requestId, authInfo));
});

const rootElement = React.createElement(RootContainer, { store });

function downloadLatestAppInfo(shouldCheckForUpdatesAtStartup) {
    if (
        shouldCheckForUpdatesAtStartup !== false &&
        !mainConfig().isSkipUpdateApps
    ) {
        return store.dispatch(AutoUpdateActions.downloadLatestAppInfo());
    }
    return Promise.resolve();
}

function checkForCoreUpdates(shouldCheckForUpdatesAtStartup) {
    if (
        shouldCheckForUpdatesAtStartup !== false &&
        !mainConfig.isSkipUpdateCore &&
        process.env.NODE_ENV !== 'development'
    ) {
        return store.dispatch(AutoUpdateActions.checkForCoreUpdates());
    }
    return Promise.resolve();
}

render(rootElement, document.getElementById('webapp'), async () => {
    await store.dispatch(UsageDataActions.checkUsageDataSetting());
    store.dispatch(await AppsActions.setAppManagementFilter());
    await store.dispatch(AppsActions.loadLocalApps());
    await store.dispatch(AppsActions.loadOfficialApps());
    store.dispatch(await AppsActions.setAppManagementShow());
    store.dispatch(await AppsActions.setAppManagementSource());

    const shouldCheckForUpdatesAtStartup = await getSetting(
        'shouldCheckForUpdatesAtStartup'
    );
    await downloadLatestAppInfo(shouldCheckForUpdatesAtStartup);
    await checkForCoreUpdates(shouldCheckForUpdatesAtStartup);
    UsageDataActions.sendEnvInfo();
});
