/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
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
