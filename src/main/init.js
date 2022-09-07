/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

require('./setUserDataDir');

const { argv } = require('yargs');
const config = require('./config');

config.init(argv);
