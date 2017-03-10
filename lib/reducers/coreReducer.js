import { combineReducers } from 'redux';
import navMenu from './navMenuReducer';
import log from './logReducer';
import serialPort from './serialPortReducer';
import firmwareDialog from './firmwareDialogReducer';

export default combineReducers({
    navMenu,
    log,
    serialPort,
    firmwareDialog,
});
