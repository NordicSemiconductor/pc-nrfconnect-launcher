/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

jest.mock('electron', () => ({
    remote: {
        require: module =>
            module === '../main/config'
                ? {
                      getVersion: () => '1.2.3-running_in_unit_test',
                  }
                : undefined,
    },
}));
