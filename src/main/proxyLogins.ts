/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { uuid } from 'short-uuid';

type LoginResponse = (username?: string, password?: string) => void;

const loginRequests = new Map<string, LoginResponse>();

export const storeProxyLoginRequest = (callback: LoginResponse) => {
    const requestId = uuid();
    loginRequests.set(requestId, callback);

    return requestId;
};

export const callRegisteredCallback = (
    requestId: string,
    host: string,
    username?: string,
    password?: string
) => {
    const callback = loginRequests.get(requestId);

    if (callback != null) {
        // set env for nrfutil
        if (username && password) {
            const proxy = `http://${username}:${password}@${host}`;
            process.env.HTTP_PROXY = proxy;
            process.env.HTTPS_PROXY = proxy;
            process.env.http_proxy = proxy;
            process.env.https_proxy = proxy;
        }

        callback(username, password);
        loginRequests.delete(requestId);
    } else {
        console.warn('No login callback found when authenticating with proxy.');
    }
};
