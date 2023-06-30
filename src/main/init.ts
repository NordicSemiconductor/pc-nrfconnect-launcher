/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first -- We have to keep the import order here, so that the user data directory is set first. */
require('./setUserDataDir');

import { init } from './config';

init();
