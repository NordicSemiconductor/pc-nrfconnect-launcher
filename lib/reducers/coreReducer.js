import { combineReducers } from 'redux';
import navMenu from './navMenuReducer';
import log from './logReducer';
import serialPort from './serialPortReducer';

export default combineReducers({
    navMenu,
    log,
    serialPort,
});
