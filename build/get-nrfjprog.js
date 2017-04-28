/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

const https = require('https');
const tar = require('tar');
const fs = require('fs');
const os = require('os');
const path = require('path');

/*
 * nRF5x-Command-Line-Tools (nrfjprog) is required for programming. This script
 * downloads nrfjprog for the current platform, so that we can bundle it with
 * the release artifacts.
 *
 * On Windows, we bundle the nrfjprog installer and run that as part of the
 * nRF Connect installer. There is no installer for Linux and macOS, so here
 * we extract the downloaded tar file and add the extracted libraries (*.so
 * files) to the artifact. This is set up in the electron-builder configuration
 * in package.json.
 */

const DOWNLOAD_DIR = path.join(__dirname, 'nrfjprog');
const UNPACKED_DIR = path.join(DOWNLOAD_DIR, 'unpacked');

const PLATFORM_CONFIG = {
    linux: {
        url: 'https://www.nordicsemi.com/eng/nordic/download_resource/51386/21/45903857/94917',
        extension: 'tar',
    },
    darwin: {
        url: 'https://www.nordicsemi.com/eng/nordic/download_resource/53402/12/46853853/99977',
        extension: 'tar',
    },
    win32: {
        url: 'https://www.nordicsemi.com/eng/nordic/download_resource/33444/40/23436026/53210',
        extension: 'exe',
    },
};

function mkdir(dirPath) {
    return new Promise((resolve, reject) => {
        fs.mkdir(dirPath, 0o775, error => {
            if (error) {
                reject(new Error(`Unable to create ${dirPath}: ${error.message}`));
            } else {
                resolve();
            }
        });
    });
}

function mkdirIfNotExists(dirPath) {
    return new Promise((resolve, reject) => {
        fs.stat(dirPath, error => {
            if (error) {
                mkdir(dirPath).then(resolve).catch(reject);
            } else {
                resolve();
            }
        });
    });
}

function downloadFile(url, destinationFile) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destinationFile);
        https.get(url, response => {
            const statusCode = response.statusCode;
            if (statusCode !== 200) {
                reject(new Error(`Unable to download ${url}. Got status code ${statusCode}`));
            } else {
                response.pipe(file);
                response.on('end', () => resolve());
            }
        });
    });
}

function extractTarFile(filePath, outputDir) {
    return new Promise((resolve, reject) => {
        const extractor = tar.Extract({ path: outputDir })
            .on('error', err => reject(err))
            .on('end', () => resolve());
        fs.createReadStream(filePath)
            .on('error', err => reject(err))
            .pipe(extractor);
    });
}

const platform = os.platform();
const platformConfig = PLATFORM_CONFIG[platform];

if (!platformConfig) {
    throw new Error(`Unsupported platform: '${platform}'`);
}

const destinationFile = path.join(DOWNLOAD_DIR, `nrfjprog-${platform}.${platformConfig.extension}`);
console.log(`Downloading nrfjprog to ${destinationFile}`);
Promise.resolve()
    .then(() => mkdirIfNotExists(DOWNLOAD_DIR))
    .then(() => downloadFile(platformConfig.url, destinationFile))
    .then(() => {
        if (platformConfig.extension === 'tar') {
            console.log(`Extracting nrfjprog to ${UNPACKED_DIR}`);
            return extractTarFile(destinationFile, UNPACKED_DIR);
        }
        return Promise.resolve();
    })
    .catch(error => console.log(`Error when downloading/extracting nrfjprog: ${error.message}`));
