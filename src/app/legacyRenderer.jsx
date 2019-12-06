import React from 'react';
import { render } from 'react-dom';

import configureStore from '../store/configureStore';
import { invokeAppFn, setApp } from '../util/apps';

import rootReducer from './reducers';
import RootContainer from './containers/RootContainer';

export default (app, container, onLoaded) => {
    setApp(app);

    const store = configureStore(rootReducer, app);
    invokeAppFn('onInit', store.dispatch, store.getState);
    render(<RootContainer store={store} />, container, () => {
        onLoaded();
        invokeAppFn('onReady', store.dispatch, store.getState);
    });
};
