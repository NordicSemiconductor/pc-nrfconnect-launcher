/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

const fs = require('fs');

function mkdir(dirPath) {
    return new Promise((resolve, reject) => {
        fs.mkdir(dirPath, 0o775, error => {
            if (error) {
                reject(
                    new Error(`Unable to create ${dirPath}: ${error.message}`)
                );
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

module.exports = {
    mkdir,
    mkdirIfNotExists,
};
