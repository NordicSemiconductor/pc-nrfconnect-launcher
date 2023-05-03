/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const { mkdir } = require('fs/promises');
const path = require('path');

const bundledJlinkVersion = require('../src/main/bundledJlinkVersion.js');

const minVersion = bundledJlinkVersion.replace('.', '');

const FILE_URL = `https://developer.nordicsemi.com/.pc-tools/jlink/JLink_Windows_${minVersion}_x86_64.exe`;
const DESTINATION_FILE_PATH = path.join(
    'build',
    `JLink_Windows_${minVersion}.exe`
);

async function downloadChecksum(fileUrl) {
    console.log('Downloading', `${fileUrl}.md5`);
    const { status, data } = await axios.get(`${fileUrl}.md5`);
    if (status !== 200) {
        throw new Error(
            `Unable to download ${fileUrl}.md5. Got status code ${status}`
        );
    }
    return data.split(' ').shift();
}

async function downloadFile(fileUrl, destinationFile, assertChecksum = true) {
    const hash = crypto.createHash('md5');
    const expectedChecksum =
        assertChecksum && (await downloadChecksum(fileUrl));
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
        stream.on('data', data => hash.update(data));
        stream.on('error', reject);
        stream.on('end', () => {
            file.end();
            const calculatedChecksum = hash.digest('hex');
            if (assertChecksum && calculatedChecksum !== expectedChecksum) {
                fs.unlinkSync(destinationFile);
                console.log('Calculated checksum:', calculatedChecksum);
                console.log('Expected checksum:  ', expectedChecksum);
                reject(new Error('Checksum verification failed.'));
            }
            resolve();
        });
    });
}

exports.default = async () => {
    // await downloadFile(
    //     'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-quickstart-0.0.1.tgz',
    //     'resources/pc-nrfconnect-quickstart-0.0.1.tgz',
    //     false
    // );

    // await downloadFile(
    //     'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-ble-4.0.4.tgz',
    //     'resources/pc-nrfconnect-ble-4.0.4.tgz',
    //     false
    // );
    await downloadFile(
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-dtm-2.1.0.tgz',
        'resources/pc-nrfconnect-dtm-2.1.0.tgz',
        false
    );
    await downloadFile(
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-linkmonitor-2.0.3.tgz',
        'resources/pc-nrfconnect-linkmonitor-2.0.3.tgz',
        false
    );
    await downloadFile(
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-ppk-3.5.5.tgz',
        'resources/pc-nrfconnect-ppk-3.5.5.tgz',
        false
    );
    await downloadFile(
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-programmer-3.0.8.tgz',
        'resources/pc-nrfconnect-programmer-3.0.8.tgz',
        false
    );
    await downloadFile(
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-rssi-1.4.4.tgz',
        'resources/pc-nrfconnect-rssi-1.4.4.tgz',
        false
    );
    await downloadFile(
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-serial-terminal-1.0.1.tgz',
        'resources/pc-nrfconnect-serial-terminal-1.0.1.tgz',
        false
    );
    await downloadFile(
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-toolchain-manager-1.2.2.tgz',
        'resources/pc-nrfconnect-toolchain-manager-1.2.2.tgz',
        false
    );
    await downloadFile(
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-tracecollector-preview-0.3.7.tgz',
        'resources/pc-nrfconnect-tracecollector-preview-0.3.7.tgz',
        false
    );
    await downloadFile(
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-tracecollector-1.1.4.tgz',
        'resources/pc-nrfconnect-tracecollector-1.1.4.tgz',
        false
    );

    if (process.platform === 'win32') {
        await downloadFile(FILE_URL, DESTINATION_FILE_PATH).catch(error => {
            console.error('\n!!! EXCEPTION', error.message);
            process.exit(-1);
        });
    }
};
