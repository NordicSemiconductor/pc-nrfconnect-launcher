/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const sharedBabelConfig = require('pc-nrfconnect-shared/config/babel.config');

module.exports = api => {
    const config = sharedBabelConfig(api);

    return {
        ...config,
        plugins: config.plugins.filter(
            plugin => plugin !== 'add-module-exports'
        ),
    };
};
