/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// eslint-disable-next-line strict,lines-around-directive -- because we are not inside a module, using strict is helpful here
'use strict';

const axios = require('axios');
const fs = require('fs');
const { mkdir } = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const config = require('./src/main/config');

if (process.platform !== 'win32') {
    console.log(
        `Unsupported platform: '${process.platform}', you need to visit https://www.segger.com/downloads/jlink`
    );
    process.exit();
}

const formatJlinkVersion = version => version.replace('.', '');
const minVersion = formatJlinkVersion(config.bundledJlinkVersion());

const FILENAME = `JLink_Windows_${minVersion}.exe`;

const FILENAME_X86 = `JLink_Windows_${minVersion}_i386.exe`;
const FILENAME_X64 = `JLink_Windows_${minVersion}_x86_64.exe`;

let targetFileName;
if (process.arch === 'ia32') {
    targetFileName = FILENAME_X86;
} else {
    targetFileName = FILENAME_X64;
}

const FILE_URL = `https://developer.nordicsemi.com/.pc-tools/jlink/${targetFileName}`;

const outputDirectory = 'build';
const DESTINATION_FILE_PATH = path.join(outputDirectory, FILENAME);

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

async function downloadFile(fileUrl, destinationFile) {
    const hash = crypto.createHash('md5');
    const expectedChecksum = await downloadChecksum(fileUrl);
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
            if (calculatedChecksum !== expectedChecksum) {
                fs.unlinkSync(destinationFile);
                console.log('Calculated checksum:', calculatedChecksum);
                console.log('Expected checksum:  ', expectedChecksum);
                reject(new Error('Checksum verification failed.'));
            }
            resolve();
        });
    });
}

downloadFile(FILE_URL, DESTINATION_FILE_PATH)
    .catch(error => {
        console.error('\n!!! EXCEPTION', error.message);
        process.exit(-1);
    })
    .then(process.exit);
