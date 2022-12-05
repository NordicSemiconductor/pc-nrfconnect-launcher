/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Run this as soon as possible, so it is set up for the other modules to be loaded afterwards
import './init';

import { initialize as initializeElectronRemote } from '@electron/remote/main';

import configureElectronApp from './configureElectronApp';
import registerIpcHandler from './registerIpcHandler';
import storeExecutablePath from './storeExecutablePath';

initializeElectronRemote();
registerIpcHandler();
configureElectronApp();
storeExecutablePath();
