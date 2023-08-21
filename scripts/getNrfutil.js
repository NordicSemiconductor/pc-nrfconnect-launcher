/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const path = require('path');
const downloadFile = require('./downloadFile');

const allConfigs = {
    win32: {
        url: 'https://developer.nordicsemi.com/.pc-tools/nrfutil/x64-windows/nrfutil.exe',
        localFile: 'nrfutil.exe',
        makeFileExecutable: false,
    },
    darwin: {
        url: 'https://developer.nordicsemi.com/.pc-tools/nrfutil/universal-osx/nrfutil',
        localFile: 'nrfutil',
        makeFileExecutable: true,
    },
    linux: {
        url: 'https://developer.nordicsemi.com/.pc-tools/nrfutil/x64-linux/nrfutil',
        localFile: 'nrfutil',
        makeFileExecutable: true,
    },
};

const config = allConfigs[process.platform];

const destinationFile = path.join('resources', config.localFile);
downloadFile(config.url, destinationFile)
    .then(() => {
        if (config.makeFileExecutable) {
            fs.chmodSync(destinationFile, fs.constants.S_IRWXU);
        }
    })
    .catch(error => {
        console.error('\n!!! EXCEPTION', error.message);
        process.exit(-1);
    });
