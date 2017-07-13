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

const fs = require('fs');
const path = require('path');
const net = require('electron').net;

/**
 * Open the given file path and return its string contents.
 *
 * @param {string} filePath path to file.
 * @returns {Promise} promise that resolves with the contents.
 */
function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (error, data) => {
            if (error) {
                reject(new Error(`Unable to read ${filePath}: ${error.message}`));
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * Open the given json file path and read all its properties into an object.
 *
 * @param {string} filePath path to json file.
 * @returns {Promise} promise that resolves with the parsed object.
 */
function readJsonFile(filePath) {
    return readFile(filePath)
        .then(data => {
            try {
                return JSON.parse(data);
            } catch (error) {
                throw new Error(`Unable to parse ${filePath}: ${error.message}`);
            }
        });
}

/**
 * List directories directly below the given path.
 *
 * @param {string} dirPath the path to look inside.
 * @returns {string[]} directory names.
 */
function listDirectories(dirPath) {
    if (fs.existsSync(dirPath)) {
        return fs.readdirSync(dirPath)
            .filter(file => {
                const fileStats = fs.statSync(path.join(dirPath, file));
                return fileStats.isDirectory();
            });
    }
    return [];
}

/**
 * Download the given url to a string. Uses the electron net API,
 * which reads proxy settings from the system. If a proxy requires
 * authentication, the onLogin function is invoked. Ref:
 * https://github.com/electron/electron/blob/master/docs/api/client-request.md
 *
 * @param {string} url the URL to download.
 * @param {Function} onLogin proxy login callback, ref. electron net API.
 * @returns {Promise} promise that resolves when the data has been downloaded.
 */
function downloadToString(url, onLogin) {
    return new Promise((resolve, reject) => {
        const request = net.request(url);
        request.setHeader('pragma', 'no-cache');
        request.on('response', response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Unable to download ${url}. Got status code ${response.statusCode}`));
                return;
            }
            let buffer = '';
            const addToBuffer = data => {
                buffer += data.toString();
            };
            response.on('data', data => addToBuffer(data));
            response.on('end', () => resolve(buffer));
            response.on('error', error => reject(new Error(`Error when reading ${url}: ${error.message}`)));
        });
        if (onLogin) {
            request.on('login', onLogin);
        }
        request.on('error', error => reject(new Error(`Unable to download ${url}: ${error.message}`)));
        request.end();
    });
}

/**
 * Download the given url to a local file path. Uses the electron net API,
 * which reads proxy settings from the system. If a proxy requires
 * authentication, the onLogin function is invoked. Ref:
 * https://github.com/electron/electron/blob/master/docs/api/client-request.md
 *
 * @param {string} url the URL to download.
 * @param {string} filePath where to store the downloaded file.
 * @param {Function} onLogin proxy login callback, ref. electron net API.
 * @returns {Promise} promise that resolves when file has been downloaded.
 */
function downloadToFile(url, filePath, onLogin) {
    return new Promise((resolve, reject) => {
        downloadToString(url, onLogin)
            .then(data => fs.writeFile(filePath, data, resolve))
            .catch(reject);
    });
}

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

function createTextFile(filePath, text) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, text, error => {
            if (error) {
                reject(new Error(`Unable to initialize ${filePath}: ${error.message}`));
            } else {
                resolve();
            }
        });
    });
}

function createTextFileIfNotExists(filePath, text) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, error => {
            if (error) {
                createTextFile(filePath, text).then(resolve).catch(reject);
            } else {
                resolve();
            }
        });
    });
}

function createJsonFile(filePath, jsonData) {
    return createTextFile(filePath, JSON.stringify(jsonData));
}

function createJsonFileIfNotExists(filePath, jsonData) {
    return createTextFileIfNotExists(filePath, JSON.stringify(jsonData));
}

module.exports = {
    readFile,
    readJsonFile,
    listDirectories,
    downloadToFile,
    downloadToString,
    mkdir,
    mkdirIfNotExists,
    createTextFile,
    createTextFileIfNotExists,
    createJsonFile,
    createJsonFileIfNotExists,
};
