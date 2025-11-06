/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from '@nordicsemiconductor/pc-nrfconnect-shared/test/dispatchTo';
import { combineReducers } from 'redux';

import { reducer as rootReducer } from '../../store';
import { getExternalSourcesSorted, setSources } from './sourcesSlice';

const reducer = combineReducers(rootReducer);

describe('sourcesSlice', () => {
    describe('getExternalSourcesSorted', () => {
        it('is empty when no custom sources are added', () => {
            const state = dispatchTo(reducer);

            expect(getExternalSourcesSorted(state)).toEqual([]);
        });

        it('filters out standard sources', () => {
            const state = dispatchTo(reducer, [
                setSources([
                    { url: 'mocked', name: 'official' },
                    { url: 'mocked', name: 'local' },
                ]),
            ]);

            expect(getExternalSourcesSorted(state)).toStrictEqual([]);
        });

        it('sorts', () => {
            const state = dispatchTo(reducer, [
                setSources([
                    { url: 'mocked', name: 'other-A' },
                    { url: 'mocked', name: 'other-C' },
                    { url: 'mocked', name: 'Other-B' },
                ]),
            ]);

            expect(getExternalSourcesSorted(state)).toStrictEqual([
                { url: 'mocked', name: 'other-A' },
                { url: 'mocked', name: 'Other-B' },
                { url: 'mocked', name: 'other-C' },
            ]);
        });
    });
});
