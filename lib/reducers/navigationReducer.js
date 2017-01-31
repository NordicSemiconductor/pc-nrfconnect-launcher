import { Record } from 'immutable';

import * as NavigationActions from '../actions/navigationActions';

const InitialState = Record({
    selectedMainView: '',
});

const initialState = new InitialState();

export default function navigation(state = initialState, action) {
    switch (action.type) {
        case NavigationActions.SELECT_MAIN_VIEW:
            return state.set('selectedMainView', action.view);
        default:
            return state;
    }
}
