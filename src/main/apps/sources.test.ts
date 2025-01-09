/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync } from 'fs';

import { readJsonFile, writeJsonFile } from '../fileUtil';
import {
    migrateSourcesJson,
    newWithdrawnJson,
    oldSourcesJsonPath,
} from './sources';

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

describe('migrating sources.json', () => {
    const mockedExistsSync = jest.mocked(existsSync);
    const mockedReadJsonFile = jest.mocked(readJsonFile);
    const mockedWriteJsonFile = jest.mocked(writeJsonFile);

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should migrate sources.json to sources-versioned.json', () => {
        const oldSourceJsonContent = {
            source1: 'http://source1.com/apps.json',
            source2: 'http://source2.com/source.json',
        };
        const newSourceVersionedJsonContent = {
            v1: [
                { name: 'source1', url: 'http://source1.com/source.json' },
                { name: 'source2', url: 'http://source2.com/source.json' },
            ],
        };

        // Arrange
        mockedExistsSync.mockImplementation(
            path => path === oldSourcesJsonPath()
        );
        mockedReadJsonFile.mockReturnValue(oldSourceJsonContent);

        // Act
        migrateSourcesJson();

        // Assert
        expect(mockedWriteJsonFile).toBeCalledWith(
            expect.anything(),
            newSourceVersionedJsonContent
        );
    });

    it('should do nothing if sources.json does not exist', () => {
        mockedExistsSync.mockReturnValue(false);

        migrateSourcesJson();

        expect(mockedReadJsonFile).not.toBeCalled();
    });

    it('should do nothing if sources-versioned.json already exists', () => {
        mockedExistsSync.mockReturnValue(true);

        migrateSourcesJson();

        expect(mockedReadJsonFile).not.toBeCalled();
    });
});
