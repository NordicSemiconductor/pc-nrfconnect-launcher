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

const axios = require('axios');
const tar = require('tar');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

/*
 * nRF5x-Command-Line-Tools (nrfjprog) is required for programming. This script
 * downloads nrfjprog for the current platform.
 *
 * On Linux/macOS, the nrfjprog libraries needs to exist below the electron
 * directory in node_modules, so that Electron finds them. The script extracts
 * the nrfjprog tar file, and copies the libraries to the correct directory.
 */

const DOWNLOAD_DIR = path.join(__dirname, 'nrfjprog');
const DOWNLOAD_URL = 'https://www.nordicsemi.com/api/sitecore/Products/DownloadPlatform';

const PLATFORM_CONFIG = {
    win32_ia32: {
        // When changing this, remember to also update the nrfjprog version in installer.nsh
        fileid: 'B96A931BEF8C400DA9BA4EADBE115071',
        destinationFile: path.join(DOWNLOAD_DIR, 'nrfjprog-installer.exe'),
        instructions: `WARNING: You must manually install the latest nRF5x command line tools on this platform. Please check the ${DOWNLOAD_DIR} directory and run the "nrfjprog-win32.exe" installer that you will find there.`,
    },
    win32_x64: {
        // When changing this, remember to also update the nrfjprog version in installer.nsh
        fileid: 'AAFC401DA6794101A4682508DA8A74C4',
        destinationFile: path.join(DOWNLOAD_DIR, 'nrfjprog-installer.exe'),
        instructions: `WARNING: You must manually install the latest nRF5x command line tools on this platform. Please check the ${DOWNLOAD_DIR} directory and run the "nrfjprog-win32.exe" installer that you will find there.`,
    },
    linux_x64: {
        fileid: '8F19D314130548209E75EFFADD9348DB',
        destinationFile: path.join(DOWNLOAD_DIR, 'nrfjprog-linux.tar'),
        extractTo: path.join(DOWNLOAD_DIR, 'unpacked'),
        copyFiles: {
            source: path.join(DOWNLOAD_DIR, 'unpacked', 'nrfjprog'),
            destination: `${__dirname}/../node_modules/electron/dist`,
            pattern: '*.so*',
        },
    },
    darwin: {
        fileid: '6E0670EF22EC4D819908809AF13CD700',
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

async function downloadFile(fileid, destinationFile) {
    const response = await axios.post(
        DOWNLOAD_URL,
        { fileid },
        { responseType: 'stream' },
    );
    const statusCode = response.status;
    if (statusCode !== 200) {
        throw new Error(`Unable to download ${DOWNLOAD_URL} with fileid ${fileid}. ` +
            `Got status code ${statusCode}`);
    }
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destinationFile);
        response.data.pipe(file);
        response.data.on('error', reject);
        response.data.on('end', () => {
            file.end();
            resolve();
        });
    });
}

function extractTarFile(filePath, outputDir) {
    return new Promise(async (resolve, reject) => {
        const extractor = tar.x({ cwd: outputDir })
            .on('error', err => reject(err))
            .on('end', () => resolve());
        await mkdirIfNotExists(outputDir);
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
    platformConfigStr = `${platform}_${arch}`;
} else if (platform === 'darwin') {
    platformConfigStr = platform;
}
const platformConfig = PLATFORM_CONFIG[platformConfigStr];

if (!platformConfig) {
    throw new Error(`Unsupported platform: '${platform}'`);
}

console.log(`Downloading nrfjprog to ${platformConfig.destinationFile}`);
Promise.resolve()
    .then(() => mkdirIfNotExists(DOWNLOAD_DIR))
    .then(() => downloadFile(platformConfig.fileid, platformConfig.destinationFile))
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
    .then(() => {
        if (platformConfig.instructions) {
            console.warn(platformConfig.instructions);
        }
    })
    .catch(error => console.log(`Error when getting nrfjprog: ${error.message}`));
