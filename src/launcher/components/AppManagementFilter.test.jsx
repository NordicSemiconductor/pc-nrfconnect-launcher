/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { sortedSources } from './AppManagementFilter';

test('sortedSources sorts the sources into official, local and then the rest in alphabetical order', () => {
    const local = {};
    const official = {};
    const OtherA = {};
    const OtherB = {};

    const sources = {
        local,
        official,
        OtherA,
        OtherB,
    };

    expect(sortedSources(sources)).toStrictEqual([
        ['official', official],
        ['local', local],
        ['OtherA', OtherA],
        ['OtherB', OtherB],
    ]);
});
