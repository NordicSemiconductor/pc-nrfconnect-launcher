/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const axios = require('axios');
const fs = require('fs');
const { mkdir } = require('fs/promises');
const path = require('path');

const nrfUrilDarwin = `https://developer.nordicsemi.com/.pc-tools/nrfutil/universal-osx/nrfutil`;
const nrfUrilLinux = `https://developer.nordicsemi.com/.pc-tools/nrfutil/x64-linux/nrfutil`;
const nrfUrilWin32 = `https://developer.nordicsemi.com/.pc-tools/nrfutil/x64-windows/nrfutil.exe`;

async function downloadFile(fileUrl, destinationFile) {
    console.log('Downloading', fileUrl);
    const { status, data: stream } = await axios.get(fileUrl, {
        responseType: 'stream',
    });
    if (status !== 200) {
        throw new Error(
            `Unable to download ${fileUrl}. Got status code ${status}`
        );
    }
    console.log('Saving', destinationFile);
    await mkdir(path.dirname(destinationFile), { recursive: true });
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destinationFile);
        stream.pipe(file);
        stream.on('error', reject);
        stream.on('end', () => {
            file.end();
            if (process.platform === 'darwin' || process.platform === 'linux') {
                fs.chmodSync(destinationFile, fs.constants.S_IRWXU);
            }
            resolve();
        });
    });
}

if (process.platform === 'win32') {
    downloadFile(nrfUrilWin32, path.join('resources', 'nrfutil.exe')).catch(
        error => {
            console.error('\n!!! EXCEPTION', error.message);
            process.exit(-1);
        }
    );
}

if (process.platform === 'darwin') {
    downloadFile(nrfUrilDarwin, path.join('resources', 'nrfutil')).catch(
        error => {
            console.error('\n!!! EXCEPTION', error.message);
            process.exit(-1);
        }
    );
}

if (process.platform === 'linux') {
    downloadFile(nrfUrilLinux, path.join('resources', 'nrfutil')).catch(
        error => {
            console.error('\n!!! EXCEPTION', error.message);
            process.exit(-1);
        }
    );
}
