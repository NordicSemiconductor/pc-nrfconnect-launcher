/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Record } from 'immutable';

import * as AppReloadDialogActions from '../actions/appReloadDialogActions';

const InitialState = Record({
    isVisible: false,
    message: '',
});

const initialState = new InitialState();

function showDialog(state, action) {
    return state.set('isVisible', true).set('message', action.message);
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case AppReloadDialogActions.APP_RELOAD_DIALOG_SHOW:
            return showDialog(state, action);
        case AppReloadDialogActions.APP_RELOAD_DIALOG_HIDE:
            return initialState;
        default:
            return state;
    }
};

export default reducer;
