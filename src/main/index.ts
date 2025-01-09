/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Run this as soon as possible, so it is set up for the other modules to be loaded afterwards
import './setUserDataDir';

import { initialize as initializeElectronRemote } from '@electron/remote/main';
import telemetry from '@nordicsemiconductor/pc-nrfconnect-shared/src/telemetry/telemetry';

import { migrateSourcesJson } from './apps/sources';
import configureElectronApp from './configureElectronApp';
import initNrfUtilProxyEnv from './initNrfUtilProxyEnv';
import registerIpcHandler from './registerIpcHandler';
import singeInstanceLock from './singeInstanceLock';
import storeExecutablePath from './storeExecutablePath';

telemetry.enableTelemetry();

initNrfUtilProxyEnv();
singeInstanceLock();
initializeElectronRemote();
migrateSourcesJson();
registerIpcHandler();
configureElectronApp();
storeExecutablePath();
