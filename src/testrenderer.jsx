/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, isPlain } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { isCollection, isRecord } from 'immutable';

// The commented out code is for when we convert this file (back) to TypeScript
/* import { Action } from 'redux'; */
import rootReducer from './launcher/reducers';

const createPreparedStore = (actions /* : Action[] */) => {
    const store = configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                // Configuring the serializableCheck is only needed while we are still using Immutable.js
                serializableCheck: {
                    isSerializable: value =>
                        isRecord(value) ||
                        isCollection(value) ||
                        isPlain(value),
                    getEntries: value =>
                        isRecord(value) || isCollection(value)
                            ? Object.entries(value.toObject())
                            : Object.entries(value),
                },
            }),
    });
    actions.forEach(store.dispatch);

    return store;
};

const preparedProvider = (actions /* : Action[] */) => (props /* : object */) =>
    <Provider store={createPreparedStore(actions)} {...props} />;

export default (
    element /* : React.ReactElement */,
    actions /* : Action[] */ = []
) => render(element, { wrapper: preparedProvider(actions) });
