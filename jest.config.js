/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const sharedConfig = require('pc-nrfconnect-shared/config/jest.config')([
    'packageJson',
]);

sharedConfig.coverageDirectory = 'src/jest-coverage';
sharedConfig.collectCoverage = true;
sharedConfig.coverageReporters = ['json', 'text'];

sharedConfig.setupFilesAfterEnv.push('<rootDir>/src/setupMocks.js');

module.exports = sharedConfig;
