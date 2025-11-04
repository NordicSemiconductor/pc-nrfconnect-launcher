/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from '@nordicsemiconductor/pc-nrfconnect-shared/test/dispatchTo';
import { combineReducers } from 'redux';

import { reducer as rootReducer } from '../../store';
import { getAllSourceNamesSorted, setSources } from './sourcesSlice';

const reducer = combineReducers(rootReducer);

describe('sourcesSlice', () => {
    describe('getAllSourceNamesSorted', () => {
        it('returns standard sources (official and local) when no custom sources are added', () => {
            const state = dispatchTo(reducer);

            expect(getAllSourceNamesSorted(state)).toStrictEqual([
                'official',
                'local',
            ]);
        });

        it('returns standard sources first, followed by custom sources in alphabetical order', () => {
            const state = dispatchTo(reducer, [
                setSources([
                    { url: 'mocked', name: 'other-A' },
                    { url: 'mocked', name: 'Other-B' },
                    { url: 'mocked', name: 'official' },
                    { url: 'mocked', name: 'local' },
                    { url: 'mocked', name: 'other-C' },
                ]),
            ]);

            expect(getAllSourceNamesSorted(state)).toStrictEqual([
                'official',
                'local',
                'other-A',
                'Other-B',
                'other-C',
            ]);
        });
    });
});
