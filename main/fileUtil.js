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

/* eslint-disable no-use-before-define */
/* eslint-disable no-bitwise */

'use strict';

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const targz = require('targz');
const chmodr = require('chmodr');
const { mkdir, mkdirIfNotExists } = require('./mkdir');

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
 * List files directly below the given path. A regular expression can optionally
 * be specified to only return matching file names.
 *
 * @param {string} dirPath the path to look inside.
 * @param {RegExp} [regex] optional regular expression.
 * @returns {string[]} file names.
 */
function listFiles(dirPath, regex) {
    if (fs.existsSync(dirPath)) {
        return fs.readdirSync(dirPath)
            .filter(file => {
                const fileStats = fs.statSync(path.join(dirPath, file));
                return fileStats.isFile();
            })
            .filter(file => {
                if (regex) {
                    return regex.test(file);
                }
                return true;
            });
    }
    return [];
}

/**
 * Delete the file at the given path.
 *
 * @param {string} filePath the file path to delete.
 * @returns {Promise} promise that resolves if successful.
 */
function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, error => {
            if (error) {
                reject(new Error(`Unable to delete ${filePath}: ${error.message}`));
            } else {
                resolve();
            }
        });
    });
}


/**
 * Delete the folder at the given path.
 *
 * @param {string} folderPath the folder path to delete.
 * @returns {Promise} promise that resolves if successful.
 */
function deleteDir(folderPath) {
    return new Promise((resolve, reject) => {
        fse.remove(folderPath, error => {
            if (error) {
                reject(new Error(`Unable to delete ${folderPath}: ${error.message}`));
            } else {
                resolve();
            }
        });
    });
}

/**
 * Copy files from source to destination
 *
 * @param {string} src the path to source.
 * @param {string} dest the path to destination.
 * @returns {Promise} promise that resolves if successful.
 */
function copy(src, dest) {
    return new Promise((resolve, reject) => {
        fse.copy(src, dest, error => {
            if (error) {
                reject(new Error(`Unable to copy ${src}: ${error.message}`));
            } else {
                resolve();
            }
        });
    });
}

/**
 * Copy files from source to destination from asar archive.
 * Since it throws permission erros in a built version when copying file from asar archive,
 * it tries to copy files several times and change the mode of file during the copying.
 * The parameter 'limit' is set to avoid endless loop and other types of errors.
 * 'limit' should be greater than the total number of files which would be copied.
 *
 * @param {string} src the path to source.
 * @param {string} dest the path to destination.
 * @param {int} limit how many times it tries to copy even if it throws error.
 * @param {int} counter count how many times it has already tried to copy.
 * @returns {Promise} promise that resolves if successful.
 */
function copyFromAsar(src, dest, limit, counter) {
    const mode = (fs.constants.S_IRWXU | fs.constants.S_IRWXG | fs.constants.S_IRWXO);
    let newCounter = counter;
    if (newCounter === undefined) {
        newCounter = 0;
    }
    return new Promise((resolve, reject) => {
        fse.copy(src, dest, error => {
            if (error) {
                newCounter += 1;
                if (limit === undefined || newCounter > limit) {
                    reject(new Error(`Error occured while copying from asar with error: ${error}`));
                }
                chmodDir(dest, mode)
                    .then(() => { copyFromAsar(src, dest, limit, newCounter); })
                    .then(() => resolve());
            } else {
                resolve();
            }
        });
    });
}

/**
 * Change file mode
 *
 * @param {string} src the path to source.
 * @param {string} mode the mode to change.
 * @returns {Promise} promise that resolves if successful.
 */
function chmodDir(src, mode) {
    return new Promise((resolve, reject) => {
        chmodr(src, mode, error => {
            if (error) {
                reject(new Error(`Unable to change mode to ${src}: ${error.message}`));
            } else {
                resolve();
            }
        });
    });
}

/**
 * Extract the given npm package (tgz file) to the given destination directory.
 *
 * @param {string} tgzFile the tgz file path to extract.
 * @param {string} destinationDir the destination directory.
 * @returns {Promise} promise that resolves if successful.
 */
function extractNpmPackage(tgzFile, destinationDir) {
    return new Promise((resolve, reject) => {
        targz.decompress({
            src: tgzFile,
            dest: destinationDir,
            tar: {
                map: header => (
                    Object.assign({}, header, {
                        // All tgz files from npm contain a directory named
                        // "package". Stripping it away.
                        name: header.name.replace(/^package\//, ''),
                    })
                ),
            },
        }, error => {
            if (error) {
                reject(new Error(`Unable to extract ${tgzFile}: ${error.message}`));
            } else {
                resolve();
            }
        });
    });
}

/**
 * Get the app name from the given *.tgz archive file. Expects the
 * file name to be on the form "{name}-{version}.tgz".
 *
 * @param {string} tgzFile the tgz file path to get name from.
 * @returns {string|null} app name or null if invalid file.
 */
function getNameFromNpmPackage(tgzFile) {
    const fileName = path.basename(tgzFile);
    const lastDash = fileName.lastIndexOf('-');
    if (lastDash > 0) {
        return fileName.substring(0, lastDash);
    }
    return null;
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
    listFiles,
    deleteFile,
    deleteDir,
    copy,
    copyFromAsar,
    chmodDir,
    extractNpmPackage,
    getNameFromNpmPackage,
    mkdir,
    mkdirIfNotExists,
    createTextFile,
    createTextFileIfNotExists,
    createJsonFile,
    createJsonFileIfNotExists,
};
