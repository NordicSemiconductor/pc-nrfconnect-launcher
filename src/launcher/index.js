/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'regenerator-runtime/runtime';

import React from 'react';
import { render } from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import * as AppsActions from './actions/appsActions';
import RootContainer from './containers/RootContainer';
import {
    checkForCoreUpdatesAtStartup,
    downloadLatestAppInfoAtStartup,
} from './features/launcherUpdate/launcherUpdateEffects';
import { loadSettings } from './features/settings/settingsEffects';
import { loadSources } from './features/sources/sourcesEffects';
import {
    checkUsageDataSetting,
    sendEnvInfo,
} from './features/usageData/usageDataEffects';
import rootReducer from './reducers';
import registerIpcHandler from './util/registerIpcHandler';

import '../../resources/css/launcher.scss';

const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk))
);
// TODO: Switch to using configureStore from RTK

const { dispatch } = store;

registerIpcHandler(dispatch);

const rootElement = React.createElement(RootContainer, { store });

render(rootElement, document.getElementById('webapp'), async () => {
    dispatch(checkUsageDataSetting());
    await dispatch(loadSettings());
    await dispatch(loadSources());
    dispatch(await AppsActions.setAppManagementFilter());
    await dispatch(AppsActions.loadLocalApps());
    await dispatch(AppsActions.loadDownloadableApps());
    dispatch(await AppsActions.setAppManagementShow());
    dispatch(await AppsActions.setAppManagementSource());
    await dispatch(downloadLatestAppInfoAtStartup());
    await dispatch(checkForCoreUpdatesAtStartup());
    sendEnvInfo();
});
