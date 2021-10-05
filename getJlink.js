/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

if (process.platform !== 'win32') {
    console.log(
        `Unsupported platform: '${process.platform}', you need to visit https://www.segger.com/downloads/jlink`
    );
    process.exit();
}

const axios = require('axios');
const fs = require('fs');
const sander = require('sander');
const path = require('path');
const crypto = require('crypto');

const minVersion = 'V688a';
const filename = `JLink_Windows_${minVersion}.exe`;
const fileUrl = `https://github.com/NordicSemiconductor/pc-nrfjprog-js/releases/download/nrfjprog/${filename}`;

const outputDirectory = 'build';
const destinationFile = path.join(outputDirectory, filename);

async function downloadChecksum() {
    console.log('Downloading', `${fileUrl}.md5`);
    const { status, data } = await axios.get(`${fileUrl}.md5`);
    if (status !== 200) {
        throw new Error(
            `Unable to download ${fileUrl}.md5. Got status code ${status}`
        );
    }
    return data.split(' ').shift();
}

async function downloadFile() {
    const hash = crypto.createHash('md5');
    const expectedChecksum = await downloadChecksum();
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
    await sander.mkdir(path.dirname(destinationFile));
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

downloadFile(fileUrl)
    .catch(error => {
        console.error('\n!!! EXCEPTION', error.message);
        process.exit(-1);
    })
    .then(process.exit);
