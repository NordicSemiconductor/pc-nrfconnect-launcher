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

const commander = require('commander');
const axios = require('axios');
const fs = require('fs');
const sander = require('sander');
const path = require('path');
const sudo = require('sudo-prompt');
const regedit = require('regedit');
const crypto = require('crypto');

commander
    .version('1.7.4')
    .usage('Utility to download and/or execute the J-Link installer.')
    .option(
        '-l, --list',
        'only list the installed versions and the required version'
    )
    .option('-s, --save-as <filename>', '')
    .option('-i, --install', 'execute the installer')
    .parse(process.argv);

const minVersion = 'V688a';
const filename = `JLink_Windows_${minVersion}.exe`;
const fileUrl = `https://github.com/NordicSemiconductor/pc-nrfjprog-js/releases/download/nrfjprog/${filename}`;

const outputDirectory = 'build';
const destinationFile = path.join(outputDirectory, filename);

function getCurrentJLinkVersion() {
    return new Promise(resolve => {
        const reg = 'HKCU\\Software\\SEGGER\\J-Link';
        regedit.list(reg, (err, result) => {
            if (err) {
                return resolve();
            }
            const versions = (result[reg].keys || []).sort();
            console.log(
                'Currently installed J-Link versions:',
                versions.join(' ')
            );
            return resolve(versions.pop());
        });
    });
}

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

function installJLink() {
    return new Promise(resolve => {
        const options = { name: 'JLink installer' };
        return sudo.exec(destinationFile, options, (error, stdout) => {
            if (error) throw error;
            console.log(stdout);
            resolve();
        });
    });
}

Promise.resolve()
    .then(() => getCurrentJLinkVersion())
    .then(currentVersion => {
        console.log('Minimum version required:', minVersion);
        if (commander.list) {
            process.exit();
        }
        if (currentVersion >= minVersion && commander.install) {
            console.log('Installation will be skipped');
            commander.install = false;
        }
    })
    .then(() => downloadFile(fileUrl))
    .then(() => commander.install && installJLink())
    .catch(error => {
        console.error('\n!!! EXCEPTION', error.message);
        process.exit(-1);
    })
    .then(process.exit);
