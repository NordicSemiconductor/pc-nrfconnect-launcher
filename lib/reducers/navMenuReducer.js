import { Record } from 'immutable';

import * as NavMenuActions from '../actions/navMenuActions';

const InitialState = Record({
    menuItems: [],
    selectedMainView: '',
});

const initialState = new InitialState();

export default function navigation(state = initialState, action) {
    switch (action.type) {
        case NavMenuActions.SELECT_MAIN_VIEW:
            return state.set('selectedMainView', action.view);
        default:
            return state;
    }
}
