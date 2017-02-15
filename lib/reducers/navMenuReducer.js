import { Record } from 'immutable';
import * as NavMenuActions from '../actions/navMenuActions';
import { decorateReducer } from '../util/plugins';

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

export default decorateReducer(reducer, 'NavMenu');
