// This state component models the currently active Modal

// Actions
const HIDE_MODAL = 'HIDE_MODAL';
const SHOW_MODAL = 'SHOW_MODAL';

export const hide = () => ({ type: HIDE_MODAL });
export const show = modal => ({ type: SHOW_MODAL, modal });


// Model
const allHiddenState = '';
const initialState = allHiddenState;


// Update
export default function (state = initialState, action) {
    switch (action.type) {
        case HIDE_MODAL:
            return allHiddenState;
        case SHOW_MODAL:
            return action.modal;
        default:
            return state;
    }
}
