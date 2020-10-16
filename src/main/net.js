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
const { net, session } = require('electron');

// Using the same session name as electron-updater, so that proxy credentials
// (if required) only have to be sent once.
const NET_SESSION_NAME = 'electron-updater';

let onProxyLogin;

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

function downloadToBuffer(url, enableProxyLogin, headers = {}) {
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
            response.on('data', data => addToBuffer(data));
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
 * @returns {Promise} promise that resolves when file has been downloaded.
 */
function downloadToFile(url, filePath, enableProxyLogin) {
    return new Promise((resolve, reject) => {
        downloadToBuffer(url, enableProxyLogin)
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
