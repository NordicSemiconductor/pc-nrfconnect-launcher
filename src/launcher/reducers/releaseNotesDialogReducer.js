/*
 * Copyright (c) 2019 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Record } from 'immutable';

import * as Actions from '../actions/releaseNotesDialogActions';

const InitialState = Record({
    source: undefined,
    name: undefined,
});
const initialState = new InitialState();

export default (state = initialState, action) => {
    switch (action.type) {
        case Actions.HIDE_RELEASE_NOTES:
            return initialState;
        case Actions.SHOW_RELEASE_NOTES:
            return state.set('name', action.name).set('source', action.source);
        default:
            return state;
    }
};
