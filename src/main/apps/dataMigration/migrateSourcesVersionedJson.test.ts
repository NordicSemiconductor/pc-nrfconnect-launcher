/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getAllSources } from '../sources/sources';
import {
    type SourcesVersionedJson,
    writeSourcesVersionedJson,
} from '../sources/sourcesVersionedJson';
import { migrateSourcesVersionedJson } from './migrateSourcesVersionedJson';
import { readV1SourcesFile } from './sourcesVersionedJsonV1';

jest.mock('./sourcesVersionedJsonV1');
jest.mock('../sources/sourcesVersionedJson');
jest.mock('../sources/sources');

describe('migrating sources-versioned.json from V1 to V2', () => {
    const mockedReadV1SourcesFile = jest.mocked(readV1SourcesFile);

    beforeEach(() => {
        jest.resetAllMocks();

        jest.mocked(getAllSources).mockReturnValue([]);
    });

    it('updates sources to use files.nordicsemi.com', () => {
        mockedReadV1SourcesFile.mockReturnValue({
            v1: [
                {
                    name: 'official',
                    url: 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/source.json',
                },
                {
                    name: '3.7 compatible apps',
                    url: 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/3.7-apps/source.json',
                },
                {
                    name: 'Latest',
                    url: 'https://files.nordicsemi.com/artifactory/swtools/internal/ncd/apps/latest/source.json',
                },
                {
                    name: '3rd Party',
                    url: 'https://example.org/source.json',
                },
            ],
        } as SourcesVersionedJson);

        migrateSourcesVersionedJson();

        expect(writeSourcesVersionedJson).toBeCalledWith({
            v1: [
                {
                    name: 'official',
                    url: 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/source.json',
                },
                {
                    name: '3.7 compatible apps',
                    url: 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/3.7-apps/source.json',
                },
                {
                    name: 'Latest',
                    url: 'https://files.nordicsemi.com/artifactory/swtools/internal/ncd/apps/latest/source.json',
                },
                {
                    name: '3rd Party',
                    url: 'https://example.org/source.json',
                },
            ],
            v2: [
                {
                    name: 'official',
                    url: 'https://files.nordicsemi.com/artifactory/swtools/external/ncd/apps/official/source.json',
                    state: 'in use',
                },
                {
                    name: '3.7 compatible apps',
                    url: 'https://files.nordicsemi.com/artifactory/swtools/external/ncd/apps/3.7-apps/source.json',
                    state: 'in use',
                },
                {
                    name: 'Latest',
                    url: 'https://files.nordicsemi.com/artifactory/swtools/internal/ncd/apps/latest/source.json',
                    state: 'in use',
                },
                {
                    name: '3rd Party',
                    url: 'https://example.org/source.json',
                    state: 'in use',
                },
            ],
        });
    });

    it('does nothing if there is no v1', () => {
        mockedReadV1SourcesFile.mockReturnValue({ v2: [] });

        migrateSourcesVersionedJson();

        expect(writeSourcesVersionedJson).not.toBeCalled();
        expect(getAllSources).not.toBeCalled();
    });

    it('does nothing if there already is a v2', () => {
        mockedReadV1SourcesFile.mockReturnValue({ v1: [], v2: [] });

        migrateSourcesVersionedJson();

        expect(writeSourcesVersionedJson).not.toBeCalled();
        expect(getAllSources).not.toBeCalled();
    });
});
