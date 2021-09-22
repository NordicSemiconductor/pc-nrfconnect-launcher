/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { decorateReducer } from '../../decoration';

// The default appReducer should not do anything. It just returns the same
// state as it receives. Not setting an initial state here, as that would
// override the initial state given by the decorated reducer.
const appReducer = state => state;

const decoratedAppReducer = decorateReducer(appReducer, 'App');

// If the reducer is not decorated, then it will return undefined. Redux does not
// allow that, so we just return an empty object in that case.
export default (state, action) => decoratedAppReducer(state, action) || {};
