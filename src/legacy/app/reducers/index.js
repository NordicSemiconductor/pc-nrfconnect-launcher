/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { combineReducers } from 'redux';

import app from './appReducer';
import core from './coreReducer';

export default combineReducers({
    core,
    app,
});
