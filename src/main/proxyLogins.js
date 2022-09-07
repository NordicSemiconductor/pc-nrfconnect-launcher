/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// @ts-check
const { v4 } = require('uuid');

/**
 * @callback LoginResponse
 * @param {string | undefined} username
 * @param {string | undefined} password
 * @returns {void}
 */

/** @type {Map<string, LoginResponse>} */
const loginRequests = new Map();

/**
 * @param {LoginResponse} callback - the callback to store
 * @returns {string} an id for the request
 */
function storeProxyLoginRequest(callback) {
    const requestId = v4();
    loginRequests.set(requestId, callback);

    return requestId;
}

/**
 * @param {string} requestId - the id for the request
 * @param {string | undefined} username - the username supplied for login at the proxy
 * @param {string | undefined} password - the password supplied for login at the proxy
 * @returns {void}
 */
function callRegisteredCallback(requestId, username, password) {
    const callback = loginRequests.get(requestId);

    if (callback != null) {
        callback(username, password);
        loginRequests.delete(requestId);
    } else {
        console.warn('No login callback found when authenticating with proxy.');
    }
}

module.exports = {
    storeProxyLoginRequest,
    callRegisteredCallback,
};
