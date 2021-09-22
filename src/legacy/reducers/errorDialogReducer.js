/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { List, Record } from 'immutable';

import * as ErrorDialogActions from '../actions/errorDialogActions';

const InitialState = Record({
    messages: List(),
    isVisible: false,
});

const initialState = new InitialState();

function showDialog(state, message) {
    const newState = state.set('isVisible', true);
    if (!newState.messages.includes(message)) {
        return newState.set('messages', newState.messages.push(message));
    }
    return newState;
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ErrorDialogActions.ERROR_DIALOG_SHOW:
            return showDialog(state, action.message);
        case ErrorDialogActions.ERROR_DIALOG_HIDE:
            return initialState;
        default:
            return state;
    }
};

export default reducer;
