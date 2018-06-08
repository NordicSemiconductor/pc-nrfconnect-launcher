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
const fs = require('fs');
const os = require('os');
const path = require('path');

/*
 * nRF5x-Command-Line-Tools (nrfjprog) is required for programming. This script
 * downloads the nrfjprog installer on Windows, so that it can be bundled together
 * with the nRF Connect installer.
 *
 * On Linux/macOS, the nrfjprog libraries are automatically installed and included
 * with the pc-nrfjprog-js library (as of pc-nrfjprog-js v1.3.0).
 */

// Currently pointing to nRF5x-Command-Line-Tools v9.7.3 Win32.
// Remember to update the version in installer.nsh when changing this.
const NRFJPROG_URL = 'https://www.nordicsemi.com/eng/nordic/download_resource/33444/48/95932377/53210';
const DOWNLOAD_DIR = path.join(__dirname, 'nrfjprog');
const DESTINATION_FILE = path.join(DOWNLOAD_DIR, 'nrfjprog-win32.exe');

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

if (os.platform() === 'win32') {
    console.log(`Downloading nrfjprog to ${DESTINATION_FILE}`);
    mkdirIfNotExists(DOWNLOAD_DIR)
        .then(() => downloadFile(NRFJPROG_URL, DESTINATION_FILE))
        .catch(error => console.log(`Error when getting nrfjprog: ${error.message}`));
}
