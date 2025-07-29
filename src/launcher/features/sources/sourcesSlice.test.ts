/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from '@nordicsemiconductor/pc-nrfconnect-shared/test/dispatchTo';

import type { RootState } from '../../store';
import reducer, {
    addSource,
    getSources,
    removeSource,
    setSources,
    type State,
} from './sourcesSlice';

const createTestSource = (name: string) =>
    ({
        name,
        url: 'https://example.org/source.json',
        state: 'in use',
    } as const);

const aTestSource = createTestSource('test source');
const anotherTestSource = createTestSource('another test source');

const asRootState = (sources: State) => ({ sources } as RootState);

describe('sourcesReducer', () => {
    it('has no sources in initial state', () => {
        const initialState = dispatchTo(reducer);

        expect(getSources(asRootState(initialState))).toEqual([]);
    });

    it('can set sources', () => {
        const sources = [aTestSource, anotherTestSource];
        const state = dispatchTo(reducer, [setSources(sources)]);

        expect(getSources(asRootState(state))).toEqual([...sources]);
    });

    it('can add a source', () => {
        const state = dispatchTo(reducer, [addSource(aTestSource)]);

        expect(getSources(asRootState(state))).toEqual([aTestSource]);
    });

    it('replaces existing source when adding with same name', () => {
        const aTestSourceWithDifferentUrl = {
            ...aTestSource,
            url: 'https://example.org/different-source.json',
        };
        const state = dispatchTo(reducer, [
            addSource(aTestSource),
            addSource(aTestSourceWithDifferentUrl),
        ]);

        expect(getSources(asRootState(state))).toEqual([
            aTestSourceWithDifferentUrl,
        ]);
    });

    it('can remove a source', () => {
        const state = dispatchTo(reducer, [
            addSource(aTestSource),
            addSource(anotherTestSource),
            removeSource(aTestSource.name),
        ]);

        expect(getSources(asRootState(state))).toEqual([anotherTestSource]);
    });
});
