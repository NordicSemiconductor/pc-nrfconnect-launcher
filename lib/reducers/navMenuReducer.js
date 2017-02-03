import { Record } from 'immutable';

import * as NavMenuActions from '../actions/navMenuActions';

const InitialState = Record({
    menuItems: [],
    selectedItemId: -1,
});

const initialState = new InitialState();

export default function navigation(state = initialState, action) {
    switch (action.type) {
        case NavMenuActions.ITEM_SELECTED:
            return state.set('selectedItemId', action.id);
        default:
            return state;
    }
}
