/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const path = require('path');

const downloadJLink =
    require('@nordicsemiconductor/nrf-jlink-js').downloadAndSaveJLink;

const bundledJLink = require('../src/main/bundledJlink');

exports.default = () =>
    downloadJLink(path.join('resources', 'prefetched', 'jlink'))
        .then(result => {
            if (bundledJLink.toLowerCase() !== result.version.toLowerCase()) {
                console.error(
                    `\n!!! ERROR: Bundled J-Link version ${bundledJLink} does not match the downloaded version ${result.version}.`
                );
                process.exit(-1);
            }
        })
        .catch(error => {
            console.error('\n!!! EXCEPTION', error.message);
            process.exit(-1);
        });
