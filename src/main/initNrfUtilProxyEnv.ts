/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import argv from './argv';

export default () => {
    const proxyServer = argv['proxy-server'] as string | undefined;
    const httpProxy = proxyServer
        ?.split(';')
        .find(p => p.startsWith('http='))
        ?.split('=')[1];

    if (httpProxy) {
        const proxy = `http://${argv['proxy-server']}`;

        process.env.HTTP_PROXY = proxy;
        process.env.HTTPS_PROXY = proxy;
        process.env.http_proxy = proxy;
        process.env.https_proxy = proxy;
    }
};
