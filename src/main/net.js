/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

const fs = require('fs');
const { net, session, ipcMain } = require('electron');

// Using the same session name as electron-updater, so that proxy credentials
// (if required) only have to be sent once.
const NET_SESSION_NAME = 'electron-updater';

// This is registered by the launcher renderer that we no longer open
let onProxyLogin = () => {};

/**
 * Register a function that should be called when a proxy asks for username
 * and password. The function receives an authInfo object and a callback function.
 * The callback function must be invoked with username and password. More info:
 * https://github.com/electron/electron/blob/master/docs/api/client-request.md
 *
 * @param {Function} onLoginRequested Signature: (authInfo, callback) => {}.
 * @returns {void}
 */
function registerProxyLoginHandler(onLoginRequested) {
    onProxyLogin = onLoginRequested;
}

let ipcRenderer;
ipcMain.on('download-start', event => {
    ipcRenderer = event.sender;
});

function reportInstallProgress({ name, source }, progress, totalInstallSize) {
    ipcRenderer?.send('progress-update', {
        name,
        source,
        progressFraction: Math.floor((progress / totalInstallSize) * 100),
    });
}

function downloadToBuffer(
    url,
    enableProxyLogin,
    headers = {},
    progressIdentifiers
) {
    return new Promise((resolve, reject) => {
        const request = net.request({
            url,
            session: session.fromPartition(NET_SESSION_NAME),
        });
        request.setHeader('pragma', 'no-cache');
        Object.keys(headers).forEach(key =>
            request.setHeader(key, headers[key])
        );

        request.on('response', response => {
            const { statusCode } = response;
            if (statusCode >= 400) {
                const error = new Error(
                    `Unable to download ${url}. Got status code ${statusCode}`
                );
                error.statusCode = statusCode;
                // https://github.com/electron/electron/issues/24948
                response.on('error', () => {});
                reject(error);
                return;
            }
            const etag = Array.isArray(response.headers.etag)
                ? response.headers.etag[0]
                : undefined;

            const buffer = [];
            const addToBuffer = data => {
                buffer.push(data);
            };
            const downloadSize = response.headers['content-length'];
            let progress = 0;
            response.on('data', data => {
                addToBuffer(data);
                progress += data.length;
                if (progressIdentifiers)
                    reportInstallProgress(
                        progressIdentifiers,
                        progress,
                        downloadSize
                    );
            });
            response.on('end', () =>
                resolve({
                    buffer: Buffer.concat(buffer),
                    etag,
                    statusCode,
                })
            );
            response.on('error', error =>
                reject(new Error(`Error when reading ${url}: ${error.message}`))
            );
        });
        if (enableProxyLogin) {
            request.on('login', onProxyLogin);
        }
        request.on('error', error =>
            reject(new Error(`Unable to download ${url}: ${error.message}`))
        );
        request.end();
    });
}

/**
 * Download the given url to a string. If an etag is provided, then use that in the request.
 * If the server returns a 304 (not modified), then just return null.
 *
 * @param {string} url the URL to download.
 * @param {string} previousEtag optional string with the eTag of the known resource.
 * @param {boolean} enableProxyLogin should the request handle login event.
 * @returns {Promise<{etag: ?string, response: ?string}>} promise that resolves when the data has
 *          been downloaded. If the resource did not change, then property response is null. If
 *          the server did not provide an Etag, then property etag will be undefined.
 */
function downloadToStringIfChanged(url, previousEtag, enableProxyLogin) {
    const requestHeaders =
        previousEtag == null ? {} : { 'If-None-Match': previousEtag };

    const NOT_MODIFIED = 304;
    return downloadToBuffer(url, enableProxyLogin, requestHeaders).then(
        ({ buffer, etag, statusCode }) => ({
            etag,
            response: statusCode === NOT_MODIFIED ? null : buffer.toString(),
        })
    );
}

/**
 * Download the given url to a json object. Uses the electron net API,
 * which reads proxy settings from the system.
 *
 * @param {string} url the URL to download.
 * @param {boolean} enableProxyLogin should the request handle login event.
 * @returns {Promise} promise that resolves when the data has been downloaded.
 */
function downloadToJson(url, enableProxyLogin) {
    return downloadToBuffer(url, enableProxyLogin).then(({ buffer }) =>
        JSON.parse(buffer)
    );
}

/**
 * Download the given url to a local file path. Uses the electron net API,
 * which reads proxy settings from the system.
 *
 * @param {string} url the URL to download.
 * @param {string} filePath where to store the downloaded file.
 * @param {boolean} enableProxyLogin should the request handle login event.
 * @param {string} progressIdentifiers name and source to identify download
 * @returns {Promise} promise that resolves when file has been downloaded.
 */
function downloadToFile(url, filePath, enableProxyLogin, progressIdentifiers) {
    return new Promise((resolve, reject) => {
        downloadToBuffer(url, enableProxyLogin, undefined, progressIdentifiers)
            .then(({ buffer }) => {
                fs.writeFile(filePath, buffer, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            })
            .catch(reject);
    });
}

/**
 * Does this error mean, that a resource was not found on the server?
 *
 * @param {object} error An error caught when trying to retrieve something from a server.
 * @returns {boolean} Whether this error means, that a resource was not found on the server.
 */
const isResourceNotFound = error => error.statusCode === 404;

module.exports = {
    downloadToFile,
    downloadToStringIfChanged,
    downloadToJson,
    isResourceNotFound,
    registerProxyLoginHandler,
};
