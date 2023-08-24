/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const path = require('path');
const downloadFile = require('../scripts/downloadFile');

const FILE_URLS = [
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/source.json',
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-cellularmonitor.json',
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-dtm.json',
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-linkmonitor.json',
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-npm.json',
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-ppk.json',
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-programmer.json',
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-quickstart.json',
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-serial-terminal.json',
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-toolchain-manager.json',
];

exports.default = () =>
    Promise.allSettled(
        FILE_URLS.map(url =>
            downloadFile(
                url,
                `resources/prefetched/${path.basename(url)}`,
                false
            )
        )
    );
