/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const path = require('path');

const downloadJLink =
    require('@nordicsemiconductor/nrf-jlink-js').downloadAndSaveJLink;

exports.default = () =>
    downloadJLink(path.join('resources', 'prefetched', 'jlink')).catch(
        error => {
            console.error('\n!!! EXCEPTION', error.message);
            process.exit(-1);
        }
    );
