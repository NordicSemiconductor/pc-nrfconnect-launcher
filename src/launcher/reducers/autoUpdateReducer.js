/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Record } from 'immutable';

import * as AutoUpdateActions from '../actions/autoUpdateActions';

const InitialState = Record({
    isUpdateAvailableDialogVisible: false,
    isUpdateProgressDialogVisible: false,
    isProgressSupported: false,
    isCancelSupported: false,
    latestVersion: '',
    percentDownloaded: 0,
    isCancelling: false,
});
const initialState = new InitialState();

function setUpdateAvailable(state, version) {
    return state
        .set('latestVersion', version)
        .set('isUpdateAvailableDialogVisible', true);
}

function setDownloading(state, action) {
    return state
        .set('isUpdateAvailableDialogVisible', false)
        .set('isUpdateProgressDialogVisible', true)
        .set('isProgressSupported', !!action.isProgressSupported)
        .set('isCancelSupported', !!action.isCancelSupported);
}

function setPercentDownloadedAsInteger(state, percentDownloaded) {
    return state.set('percentDownloaded', parseInt(percentDownloaded, 10));
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case AutoUpdateActions.AUTO_UPDATE_AVAILABLE:
            return setUpdateAvailable(state, action.version);
        case AutoUpdateActions.AUTO_UPDATE_POSTPONE:
            return state.set('isUpdateAvailableDialogVisible', false);
        case AutoUpdateActions.AUTO_UPDATE_START_DOWNLOAD:
            return setDownloading(state, action);
        case AutoUpdateActions.AUTO_UPDATE_DOWNLOADING:
            return setPercentDownloadedAsInteger(
                state,
                action.percentDownloaded
            );
        case AutoUpdateActions.AUTO_UPDATE_CANCEL_DOWNLOAD:
            return state.set('isCancelling', true);
        case AutoUpdateActions.AUTO_UPDATE_DOWNLOAD_CANCELLED:
            return initialState;
        case AutoUpdateActions.AUTO_UPDATE_ERROR:
            return initialState;
        default:
            return state;
    }
};

export default reducer;
