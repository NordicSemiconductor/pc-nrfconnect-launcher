/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const baseConfig = require('@nordicsemiconductor/pc-nrfconnect-shared/config/tailwind.config.js');

const config = {
    ...baseConfig,
};

config.theme.extend.fontSize.md = '0.9rem'; // 14.4px

module.exports = config;
