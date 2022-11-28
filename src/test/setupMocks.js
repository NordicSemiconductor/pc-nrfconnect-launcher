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
    app: {
        on: jest.fn(),
    },
}));
