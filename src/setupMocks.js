/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

jest.mock('@electron/remote', () => ({
    require: module => {
        if (module === '../main/config')
            return {
                getVersion: () => '1.2.3-running_in_unit_test',
            };
        if (module === '../main/autoUpdate')
            return {
                autoUpdater: {},
                CancellationToken: class CancellationToken {},
            };
        return undefined;
    },
    getCurrentWindow: () => ({
        reload: jest.fn(),

        getTitle: () => 'Not launcher',
    }),
    app: {
        getAppPath: () => process.cwd(),
    },
}));
