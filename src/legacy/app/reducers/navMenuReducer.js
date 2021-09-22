/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Record } from 'immutable';

import * as NavMenuActions from '../actions/navMenuActions';

const InitialState = Record({
    menuItems: [],
    selectedItemId: -1,
});

const initialState = new InitialState();

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case NavMenuActions.ITEM_SELECTED:
            return state.set('selectedItemId', action.id);
        default:
            return state;
    }
};

export default reducer;
