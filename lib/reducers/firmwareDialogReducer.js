import { Record } from 'immutable';
import * as FirmwareDialogActions from '../actions/firmwareDialogActions';
import { decorateReducer } from '../util/plugins';
import { getImmutableSerialPort } from '../util/immutableModels';

const InitialState = Record({
    port: null,
    isVisible: false,
    isInProgress: false,
});

const initialState = new InitialState();

function showDialog(state, port) {
    return state.set('port', getImmutableSerialPort(port))
        .set('isVisible', true);
}

function hideDialog(state) {
    return state.set('port', null)
        .set('isVisible', false);
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FirmwareDialogActions.FIRMWARE_DIALOG_SHOW:
            return showDialog(state, action.port);
        case FirmwareDialogActions.FIRMWARE_DIALOG_HIDE:
            return hideDialog(state);
        case FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_REQUESTED:
            return state.set('isInProgress', true);
        case FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_SUCCESS:
        case FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_ERROR:
            return initialState;
        default:
            return state;
    }
};

export default decorateReducer(reducer, 'FirmwareDialog');
