/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Action } from 'redux';

import rootReducer from './launcher/reducers';

const createPreparedStore = (actions: Action[]) => {
    const store = configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({ serializableCheck: false }),
    });
    actions.forEach(store.dispatch);

    return store;
};

const preparedProvider = (actions: Action[]) => (props: object) =>
    <Provider store={createPreparedStore(actions)} {...props} />;

export default (element: React.ReactElement, actions: Action[] = []) =>
    render(element, { wrapper: preparedProvider(actions) });
