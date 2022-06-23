/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

jest.mock('electron', () => ({
    ipcRenderer: {
        sendSync: channel =>
            channel === 'get-config'
                ? {
                      mocked: 'in tests',
                  }
                : 'Unknown channel used in tests',
    },
}));

jest.mock('@electron/remote', () => ({
    require: module => {
        if (module === '../main/autoUpdate')
            return {
                autoUpdater: {},
                CancellationToken: class CancellationToken {},
            };
        return undefined;
    },
    getCurrentWindow: () => ({
        getTitle: () => 'Not launcher',
    }),
}));
