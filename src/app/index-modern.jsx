/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// import 'regenerator-runtime/runtime';
import './module-loader-modern';

import initApp from './initApp';

const params = new URL(window.location).searchParams;
const appPath = params.get('appPath');

initApp(appPath, true);
