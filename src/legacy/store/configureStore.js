/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

function createMiddleware(appMiddleware) {
    const middlewares = [thunk];

    if (appMiddleware) {
        middlewares.push(appMiddleware);
    }

    return composeWithDevTools(applyMiddleware(...middlewares));
}

export default (rootReducer, app = {}) =>
    createStore(rootReducer, createMiddleware(app.middleware));
