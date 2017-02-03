import { combineReducers } from 'redux';
import navigation from './navigationReducer';

/*
import adapter from './adapterReducer';
import errorDialog from './errorDialogReducer';
 */
import log from './logReducer';

export default combineReducers({
    navigation,
    log,
    /*
    adapter,
    errorDialog,
    log,
    */
});
