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
        url: 'https://files.nordicsemi.com/artifactory/swtools/external/nrfutil/executables/x86_64-pc-windows-msvc/nrfutil.exe',
        localFile: 'nrfutil.exe',
        makeFileExecutable: false,
    },
    darwin: {
        url: 'https://files.nordicsemi.com/artifactory/swtools/external/nrfutil/executables/universal-apple-darwin/nrfutil',
        localFile: 'nrfutil',
        makeFileExecutable: true,
    },
    linux: {
        url: 'https://files.nordicsemi.com/artifactory/swtools/external/nrfutil/executables/x86_64-unknown-linux-gnu/nrfutil',
        localFile: 'nrfutil',
        makeFileExecutable: true,
    },
};

const config = allConfigs[process.platform];

const destinationFile = path.join('resources', config.localFile);

if (fs.existsSync(destinationFile)) {
    console.log(`${destinationFile} already exists, not downloading it again.`);
    return;
}

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
