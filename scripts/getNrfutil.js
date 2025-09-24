/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const path = require('path');
const downloadFile = require('./downloadFile');

// This function is currently a copy from nrfutil/sandbox.ts in shared.
const getTriplet = () => {
    switch (process.platform) {
        case 'darwin':
            return process.arch === 'arm64'
                ? 'aarch64-apple-darwin'
                : 'x86_64-apple-darwin';
        case 'linux':
            return process.arch === 'arm64'
                ? 'aarch64-unknown-linux-gnu'
                : 'x86_64-unknown-linux-gnu';
        case 'win32':
            return 'x86_64-pc-windows-msvc';
        default:
            throw new Error(`Unsupported platform: ${process.platform}`);
    }
};

const allConfigs = {
    win32: {
        localFile: 'nrfutil.exe',
        makeFileExecutable: false,
    },
    darwin: {
        localFile: 'nrfutil',
        makeFileExecutable: true,
    },
    linux: {
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

downloadFile(
    `https://files.nordicsemi.com/artifactory/swtools/external/nrfutil/executables/${getTriplet()}/${
        config.localFile
    }`,
    destinationFile
)
    .then(() => {
        if (config.makeFileExecutable) {
            fs.chmodSync(destinationFile, fs.constants.S_IRWXU);
        }
    })
    .catch(error => {
        console.error('\n!!! EXCEPTION', error.message);
        process.exit(-1);
    });
