/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export default () => {
    const index = process.argv.findIndex(p => p.includes('--proxy-server'));
    if (index !== -1) {
        const proxy = `http://${process.argv[index].split('=')[1]}`;
        process.env.HTTP_PROXY = proxy;
        process.env.HTTPS_PROXY = proxy;
        process.env.http_proxy = proxy;
        process.env.https_proxy = proxy;
    }
};
