/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import argv from './argv';

export default () => {
    const proxyServer = argv['proxy-server'] as string | undefined;
    if (proxyServer) {
        const proxy = `http://${proxyServer}`;

        process.env.HTTP_PROXY = proxy;
        process.env.HTTPS_PROXY = proxy;
        process.env.http_proxy = proxy;
        process.env.https_proxy = proxy;
    }
};
