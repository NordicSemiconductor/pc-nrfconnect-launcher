/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { Stream } from 'stream';

import bundledJlinkVersion from '../src/main/bundledJlinkVersion';

if (process.platform !== 'win32') {
    console.log(
        `Unsupported platform: '${process.platform}', you need to visit https://www.segger.com/downloads/jlink`
    );
    process.exit();
}

const minVersion = bundledJlinkVersion.replace('.', '');

const FILE_URL = `https://developer.nordicsemi.com/.pc-tools/jlink/JLink_Windows_${minVersion}_x86_64.exe`;
const DESTINATION_FILE_PATH = path.join(
    'build',
    `JLink_Windows_${minVersion}.exe`
);

async function downloadChecksum(fileUrl: string) {
    console.log('Downloading', `${fileUrl}.md5`);
    const { status, data } = await axios.get<string>(`${fileUrl}.md5`);
    if (status !== 200) {
        throw new Error(
            `Unable to download ${fileUrl}.md5. Got status code ${status}`
        );
    }
    return data.split(' ').shift();
}

async function downloadFile(fileUrl: string, destinationFile: string) {
    const hash = crypto.createHash('md5');
    const expectedChecksum = await downloadChecksum(fileUrl);
    console.log('Downloading', fileUrl);
    const { status, data: stream } = await axios.get<Stream>(fileUrl, {
        responseType: 'stream',
    });
    if (status !== 200) {
        throw new Error(
            `Unable to download ${fileUrl}. Got status code ${status}`
        );
    }
    console.log('Saving', destinationFile);
    await mkdir(path.dirname(destinationFile), { recursive: true });
    return new Promise<void>((resolve, reject) => {
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
    .then(() => process.exit());
