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
const path = require('path');
const exec = require('child_process').exec ;

/*
 * nRF5x-Command-Line-Tools (nrfjprog) is required for programming. This script
 * downloads nrfjprog for the current platform.
 *
 * On Linux/macOS, the nrfjprog libraries needs to exist below the electron
 * directory in node_modules, so that Electron finds them. The script extracts
 * the nrfjprog tar file, and copies the libraries to the correct directory.
 */

const DOWNLOAD_DIR = path.join(__dirname, 'nrfjprog');

const PLATFORM_CONFIG = {
    win32_ia32: {
        // When changing this, remember to also update the nrfjprog version in installer.nsh
        url: 'https://www.nordicsemi.com/eng/nordic/download_resource/58850/51/33271593/53210',
        destinationFile: path.join(DOWNLOAD_DIR, 'nrfjprog-win32-ia32.exe'),
        instructions: "WARNING: You must manually install the latest nRF5x command line tools on this platform. Please check the " + DOWNLOAD_DIR + " directory and run the \"nrfjprog-win32.exe\" installer that you will find there.",
    },
    win32_x64: {
        // When changing this, remember to also update the nrfjprog version in installer.nsh
        url: 'https://www.nordicsemi.com/eng/nordic/download_resource/70507/2/82059498/150713',
        destinationFile: path.join(DOWNLOAD_DIR, 'nrfjprog-win32-x64.exe'),
        instructions: "WARNING: You must manually install the latest nRF5x command line tools on this platform. Please check the " + DOWNLOAD_DIR + " directory and run the \"nrfjprog-win32.exe\" installer that you will find there.",
    },
    linux_x64: {
        url: 'https://www.nordicsemi.com/eng/nordic/download_resource/58852/30/91363763/94917',
        destinationFile: path.join(DOWNLOAD_DIR, 'nrfjprog-linux-x64.tar'),
        extractTo: path.join(DOWNLOAD_DIR, 'unpacked'),
        copyFiles: {
            source: path.join(DOWNLOAD_DIR, 'unpacked', 'nrfjprog'),
            destination: `${__dirname}/../node_modules/electron/dist`,
            pattern: '*.so*',
        },
    },
    darwin: {
        url: 'https://www.nordicsemi.com/eng/nordic/download_resource/58855/22/48944001/99977',
        destinationFile: path.join(DOWNLOAD_DIR, 'nrfjprog-darwin.tar'),
        extractTo: path.join(DOWNLOAD_DIR, 'unpacked'),
        copyFiles: {
            source: path.join(DOWNLOAD_DIR, 'unpacked', 'nrfjprog'),
            destination: `${__dirname}/../node_modules/electron/dist/Electron.app/Contents/Frameworks`,
            pattern: '*.dylib',
        },
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

function copyFiles(source, destination, pattern) {
    return new Promise((resolve, reject) => {
        exec(`cp ${source}/${pattern} ${destination}`, error => {
            if (error) {
                reject(new Error(`Unable to copy files: ${error.message}`));
            } else {
                resolve();
            }
        });
    });
}

const platform = process.platform;
const arch = process.arch;
let platformConfigStr;
if (platform === 'win32' || platform === 'linux') {
    platformConfigStr = `${platform}_${arch}`
} else if (platform === 'darwin') {
    platformConfigStr = platform
}
const platformConfig = PLATFORM_CONFIG[platformConfigStr];

if (!platformConfig) {
    throw new Error(`Unsupported platform: '${platform}'`);
}

console.log(`Downloading nrfjprog to ${platformConfig.destinationFile}`);
Promise.resolve()
    .then(() => mkdirIfNotExists(DOWNLOAD_DIR))
    .then(() => downloadFile(platformConfig.url, platformConfig.destinationFile))
    .then(() => {
        if (platformConfig.extractTo) {
            console.log(`Extracting nrfjprog to ${platformConfig.extractTo}`);
            return extractTarFile(platformConfig.destinationFile, platformConfig.extractTo);
        }
        return Promise.resolve();
    })
    .then(() => {
        if (platformConfig.copyFiles) {
            const copyConfig = platformConfig.copyFiles;
            console.log(`Copying nrfjprog libs from ${copyConfig.source} to ${copyConfig.destination}`);
            return copyFiles(copyConfig.source, copyConfig.destination, copyConfig.pattern);
        }
        return Promise.resolve();
    })
    .then(()=>{
        if (platformConfig.instructions) {
            console.warn(platformConfig.instructions);
        }
    })
    .catch(error => console.log(`Error when getting nrfjprog: ${error.message}`));
