/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'regenerator-runtime/runtime';

import React from 'react';
import { render } from 'react-dom';
import { ErrorDialogActions, usageData } from 'pc-nrfconnect-shared';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import { registerDownloadProgress } from '../ipc/downloadProgress';
import {
    registerUpdateFinished,
    registerUpdateProgress,
    registerUpdateStarted,
} from '../ipc/launcherUpdateProgress';
import { registerRequestProxyLogin } from '../ipc/proxyLogin';
import { getSetting } from '../ipc/settings';
import { registerShowErrorDialog } from '../ipc/showErrorDialog';
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

registerDownloadProgress(progress => {
    store.dispatch({ type: AppsActions.UPDATE_DOWNLOAD_PROGRESS, ...progress });
});

registerShowErrorDialog(errorMessage => {
    store.dispatch(ErrorDialogActions.showDialog(errorMessage));
});

registerRequestProxyLogin((requestId, authInfo) => {
    store.dispatch(ProxyActions.authenticate(requestId, authInfo));
});

registerUpdateStarted(() => {
    store.dispatch(AutoUpdateActions.startDownloadAction());
});
registerUpdateProgress(percentage => {
    store.dispatch(AutoUpdateActions.updateDownloadingAction(percentage));
});
registerUpdateFinished(isSuccessful => {
    if (isSuccessful) {
        usageData.reset();
    }
    store.dispatch(AutoUpdateActions.resetAction());
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
    await store.dispatch(AppsActions.loadDownloadableApps());
    store.dispatch(await AppsActions.setAppManagementShow());
    store.dispatch(await AppsActions.setAppManagementSource());

    const shouldCheckForUpdatesAtStartup = await getSetting(
        'shouldCheckForUpdatesAtStartup'
    );
    await downloadLatestAppInfo(shouldCheckForUpdatesAtStartup);
    await checkForCoreUpdates(shouldCheckForUpdatesAtStartup);
    UsageDataActions.sendEnvInfo();
});
