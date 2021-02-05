import React from 'react';
import { render } from 'react-dom';

import RootContainer from './app/containers/RootContainer';
import rootReducer from './app/reducers';
import { invokeAppFn, setApp } from './decoration';
import configureStore from './store/configureStore';

export default (app, container, onLoaded) => {
    setApp(app);

    const store = configureStore(rootReducer, app);
    invokeAppFn('onInit', store.dispatch, store.getState);
    render(<RootContainer store={store} />, container, () => {
        onLoaded();
        invokeAppFn('onReady', store.dispatch, store.getState);
    });
};
