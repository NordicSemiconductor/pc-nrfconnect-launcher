/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { OFFICIAL } from '../../../common/sources';
import {
    addToSourceList,
    getAllSources,
    getSource,
    removeFromSourceList,
    resetStateForTests,
} from './sources';
import { loadAllSources, writeSourcesFile } from './sourcesVersionedJson';

jest.mock('./sourcesVersionedJson');

const mockLoadAllSources = jest.mocked(loadAllSources);
const mockWriteSourcesFile = jest.mocked(writeSourcesFile);

mockLoadAllSources.mockReturnValue([]);
mockWriteSourcesFile.mockImplementation(() => {});

const testSource = {
    name: 'test',
    url: 'https://example.org/source.json',
    state: 'in use',
} as const;

describe('sources', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetStateForTests();
    });

    it('always has the official source', () => {
        const sources = getAllSources();
        const officialSource = sources[0];

        expect(officialSource).toBeDefined();
        expect(officialSource).toMatchObject({
            name: OFFICIAL,
            url: expect.any(String),
            state: 'in use',
        });
    });

    it('can have a source added', () => {
        addToSourceList(testSource);

        const officialSource = getSource('test');
        expect(officialSource).toEqual({ ...testSource });
    });

    it('saves added sources', () => {
        addToSourceList(testSource);

        expect(mockWriteSourcesFile).toHaveBeenLastCalledWith(
            expect.arrayContaining([testSource])
        );
    });

    it('can have a source removed', () => {
        addToSourceList(testSource);
        removeFromSourceList(testSource.name);

        const officialSource = getSource('test');
        expect(officialSource).toBeUndefined();
    });

    it('saves removed sources', () => {
        addToSourceList(testSource);
        removeFromSourceList(testSource.name);

        expect(mockWriteSourcesFile).toHaveBeenLastCalledWith(
            expect.not.arrayContaining([testSource])
        );
    });
});
