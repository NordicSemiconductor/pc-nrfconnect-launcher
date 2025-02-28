/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { newWithdrawnJson } from './withdrawnJson';

jest.mock('fs');
jest.mock('../fileUtil');

test('computing the new list of withdrawn apps', () => {
    const oldWithdrawnJson = [
        'http://example.org/oldWithdrawnApp.json',
        'http://example.org/revivedApp.json',
    ];
    const oldSourceJson = {
        name: 'a source',
        apps: [
            'http://example.org/oldAvailableApp.json',
            'http://example.org/newlyWithdrawnApp.json',
        ],
    };

    const newSourceJson = {
        name: 'a source',
        apps: [
            'http://example.org/oldAvailableApp.json',
            'http://example.org/newlyAvailableApp.json',
            'http://example.org/revivedApp.json',
        ],
    };

    expect(
        newWithdrawnJson(oldWithdrawnJson, oldSourceJson, newSourceJson)
    ).toEqual([
        'http://example.org/oldWithdrawnApp.json',
        'http://example.org/newlyWithdrawnApp.json',
    ]);
});
