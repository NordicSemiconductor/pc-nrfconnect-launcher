/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import electron from 'electron';
import bleDriverJs from 'pc-ble-driver-js';
import { logger } from 'pc-nrfconnect-shared';
import serialPort from 'serialport';

import * as core from './core';

const bleDriver = bleDriverJs.api ? bleDriverJs.api : bleDriverJs;

core.logger = logger;

export { bleDriver, serialPort, logger, electron, core };
