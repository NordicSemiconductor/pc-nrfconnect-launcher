/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type SourcesVersionedJson,
    writeSourcesVersionedJson,
} from '../sources';
import {
    migrateSourcesVersionedJson,
    migrateURL,
} from './migrateSourcesVersionedJson';
import { readV1SourcesFile } from './sourcesVersionedJsonV1';

jest.mock('./sourcesVersionedJsonV1');
jest.mock('../sources');

describe('converting URLs from developer.nordicsemi.com to files.nordicsemi.com', () => {
    test('official is in external', () => {
        expect(
            migrateURL(
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/source.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/source.json'
        );
    });

    test('3.*-apps are in external', () => {
        expect(
            migrateURL(
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/3.7-apps/pc-nrfconnect-rssi.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/3.7-apps/pc-nrfconnect-rssi.json'
        );

        expect(
            migrateURL(
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/3.11-apps/pc-nrfconnect-ble.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/3.11-apps/pc-nrfconnect-ble.json'
        );
    });

    test('direction-finding is external-confidential', () => {
        expect(
            migrateURL(
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/directionfinding/source.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external-confidential/ncd/apps/directionfinding/source.json'
        );
    });

    test('everything else is internal', () => {
        expect(
            migrateURL(
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/secret/pc-nrfconnect-secret.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=internal/ncd/apps/secret/pc-nrfconnect-secret.json'
        );
    });
});

describe('migrating sources-versioned.json from V1 to V2', () => {
    const mockedReadV1SourcesFile = jest.mocked(readV1SourcesFile);

    beforeEach(() => {
        jest.resetAllMocks();
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
                    url: 'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=internal/ncd/apps/latest/source.json',
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
                    url: 'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=internal/ncd/apps/latest/source.json',
                },
                {
                    name: '3rd Party',
                    url: 'https://example.org/source.json',
                },
            ],
            v2: [
                {
                    name: 'official',
                    url: 'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/source.json',
                },
                {
                    name: '3.7 compatible apps',
                    url: 'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/3.7-apps/source.json',
                },
                {
                    name: 'Latest',
                    url: 'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=internal/ncd/apps/latest/source.json',
                },
                {
                    name: '3rd Party',
                    url: 'https://example.org/source.json',
                },
            ],
        });
    });

    it('does nothing if there is no v1', () => {
        mockedReadV1SourcesFile.mockReturnValue({ v2: [] });

        migrateSourcesVersionedJson();

        expect(writeSourcesVersionedJson).not.toBeCalled();
    });

    it('does nothing if there already is a v2', () => {
        mockedReadV1SourcesFile.mockReturnValue({ v1: [], v2: [] });

        migrateSourcesVersionedJson();

        expect(writeSourcesVersionedJson).not.toBeCalled();
    });
});
