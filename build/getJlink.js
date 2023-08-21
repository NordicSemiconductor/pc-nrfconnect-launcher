/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const path = require('path');
const downloadFile = require('../scripts/downloadFile');

const bundledJlinkVersion = require('../src/main/bundledJlinkVersion.js');

const minVersion = bundledJlinkVersion.replace('.', '');

const FILE_URL = `https://developer.nordicsemi.com/.pc-tools/jlink/JLink_Windows_${minVersion}_x86_64.exe`;
const DESTINATION_FILE_PATH = path.join(
    'build',
    `JLink_Windows_${minVersion}.exe`
);

exports.default = () =>
    process.platform === 'win32'
        ? downloadFile(FILE_URL, DESTINATION_FILE_PATH, true).catch(error => {
              console.error('\n!!! EXCEPTION', error.message);
              process.exit(-1);
          })
        : undefined;
