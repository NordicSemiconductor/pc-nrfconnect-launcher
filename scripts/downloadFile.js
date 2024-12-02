/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const axios = require('axios');
const fs = require('fs');
const { mkdir } = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const downloadChecksum = async fileUrl => {
    console.log('Downloading', fileUrl);
    const { status, data } = await axios.get(fileUrl);
    if (status !== 200) {
        throw new Error(
            `Unable to download ${fileUrl}. Got status code ${status}`
        );
    }
    return data.split(' ').shift();
};

module.exports = async (fileUrl, destinationFile, useChecksum = false) => {
    const hash = crypto.createHash('md5');

    console.log('Started Download', fileUrl);
    const { status, data: stream } = await axios.get(fileUrl, {
        responseType: 'stream',
    });
    if (status !== 200) {
        throw new Error(
            `Unable to download ${fileUrl}. Got status code ${status}`
        );
    }
    await mkdir(path.dirname(destinationFile), { recursive: true });
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destinationFile);
        stream.pipe(file);
        stream.on('data', data => hash.update(data));
        stream.on('error', reject);
        stream.on('end', () => {
            file.end(async () => {
                console.log('🏁 Finish Download', fileUrl);
                console.log('🏁 Saved to', destinationFile);
                if (useChecksum) {
                    const calculatedChecksum = hash.digest('hex');
                    const expectedChecksum = await downloadChecksum(
                        `${fileUrl}.md5`
                    );

                    if (calculatedChecksum !== expectedChecksum) {
                        fs.unlinkSync(destinationFile);
                        console.log('Calculated checksum:', calculatedChecksum);
                        console.log('Expected checksum:  ', expectedChecksum);
                        reject(new Error('Checksum verification failed.'));
                        return;
                    }
                }

                resolve();
            });
        });
    });
};
