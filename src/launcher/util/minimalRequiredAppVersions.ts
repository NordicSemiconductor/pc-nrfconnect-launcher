/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export default {
    'pc-nrfconnect-cellularmonitor':
        process.platform === 'darwin' && process.arch !== 'x64'
            ? '2.4.0'
            : '2.0.0',
    'pc-nrfconnect-dtm': '2.2.0',
    'pc-nrfconnect-npm': '1.0.0',
    'pc-nrfconnect-ppk': '4.0.0',
    'pc-nrfconnect-programmer': '4.4.2',
    'pc-nrfconnect-rssi': '1.5.0',
    'pc-nrfconnect-serial-terminal': '1.2.0',
    'pc-nrfconnect-toolchain-manager': '1.5.3',
    'pc-nrfconnect-gettingstarted': null,
    'pc-nrfconnect-linkmonitor': null,
    'pc-nrfconnect-tracecollector-preview': null,
    'pc-nrfconnect-tracecollector': null,
} as Record<string, string | null>;
