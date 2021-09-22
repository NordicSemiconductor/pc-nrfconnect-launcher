/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-use-before-define */
/* eslint-disable no-bitwise */

'use strict';

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const targz = require('targz');
const chmodr = require('chmodr');
const { v4 } = require('uuid');
const { mkdir, mkdirIfNotExists } = require('./mkdir');
const config = require('./config');

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
                reject(
                    new Error(`Unable to read ${filePath}: ${error.message}`)
                );
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
    return readFile(filePath).then(data => {
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
        return fs.readdirSync(dirPath).filter(file => {
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
        return fs
            .readdirSync(dirPath)
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
                reject(
                    new Error(`Unable to delete ${filePath}: ${error.message}`)
                );
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
                reject(
                    new Error(
                        `Unable to delete ${folderPath}: ${error.message}`
                    )
                );
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
 *
 * @param {string} src the path to source.
 * @param {string} dest the path to destination.
 * @param {number} stripComponents the number of components to strip.
 * @returns {Promise} promise that resolves if successful.
 */
function untar(src, dest, stripComponents = 0) {
    const pattern = new RegExp(`(.*?/){${stripComponents}}`);
    return new Promise((resolve, reject) => {
        targz.decompress(
            {
                src,
                dest,
                tar: {
                    map: header => ({
                        ...header,
                        name: header.name.replace(pattern, ''),
                    }),
                },
            },
            error => {
                if (error) {
                    reject(
                        new Error(`Unable to extract ${src}: ${error.message}`)
                    );
                } else {
                    resolve();
                }
            }
        );
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
                reject(
                    new Error(
                        `Unable to change mode to ${src}: ${error.message}`
                    )
                );
            } else {
                resolve();
            }
        });
    });
}

/**
 * Create a unique name for a temporary file or folder. The file is not
 * created, this just generates an absolute name for it in the directory
 * for temporary files.
 *
 * @param {string} basename a basename to include in the name to make it easier
 * to recognise
 * @returns {string} the unique file name
 */
function getTmpFilename(basename) {
    return path.join(config.getTmpDir(), `${basename}-${v4()}`);
}

/**
 * Extract the given npm package (tgz file) to the given destination directory.
 *
 * @param {string} appName  the name of the app to extract
 * @param {string} tgzFile the tgz file path to extract.
 * @param {string} destinationDir the destination directory.
 * @returns {Promise} promise that resolves if successful.
 */
function extractNpmPackage(appName, tgzFile, destinationDir) {
    const tmpDir = getTmpFilename(appName);
    const moveToDestinationDir = () =>
        fse.move(tmpDir, destinationDir, { overwrite: true });

    return untar(tgzFile, tmpDir, 1).then(moveToDestinationDir);
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
                reject(
                    new Error(
                        `Unable to initialize ${filePath}: ${error.message}`
                    )
                );
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
    readJsonFile,
    listDirectories,
    listFiles,
    deleteFile,
    deleteDir,
    copy,
    untar,
    chmodDir,
    getTmpFilename,
    extractNpmPackage,
    getNameFromNpmPackage,
    mkdir,
    mkdirIfNotExists,
    createTextFile,
    createTextFileIfNotExists,
    createJsonFile,
    createJsonFileIfNotExists,
};
