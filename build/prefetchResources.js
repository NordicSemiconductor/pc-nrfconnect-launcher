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

async function downloadQuickstart() {
    // TODO: Read this out from the downloaded json in downloadInternalSource?
    const FILE_URL =
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/internal/pc-nrfconnect-quickstart-0.0.1.tgz';
    const DESTINATION_FILE_PATH = path.join(
        `resources/prefetched/${path.basename(FILE_URL)}`
    );

    await downloadFile(FILE_URL, DESTINATION_FILE_PATH, false);
}

async function downloadInternalSource() {
    // TODO: Read out the individual app json locations from source.json?
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

    await Promise.allSettled(
        FILE_URLS.map(url =>
            downloadFile(
                url,
                `resources/prefetched/${path.basename(url)}`,
                false
            )
        )
    );

    await downloadQuickstart();
}

async function downloadJLink() {
    const minVersion = bundledJlinkVersion.replace('.', '');

    const FILE_URL = `https://developer.nordicsemi.com/.pc-tools/jlink/JLink_Windows_${minVersion}_x86_64.exe`;
    const DESTINATION_FILE_PATH = path.join(
        'build',
        `JLink_Windows_${minVersion}.exe`
    );

    if (process.platform === 'win32') {
        await downloadFile(FILE_URL, DESTINATION_FILE_PATH).catch(error => {
            console.error('\n!!! EXCEPTION', error.message);
            process.exit(-1);
        });
    }
}

exports.default = async () => {
    await downloadJLink();
    await downloadInternalSource();
};