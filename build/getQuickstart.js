/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const path = require('path');
const downloadFile = require('../scripts/downloadFile');

const FILE_URL =
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-quickstart-0.0.1.tgz';
const DESTINATION_FILE_PATH = path.join(
    `resources/prefetched/${path.basename(FILE_URL)}`
);

exports.default = () => downloadFile(FILE_URL, DESTINATION_FILE_PATH, false);
