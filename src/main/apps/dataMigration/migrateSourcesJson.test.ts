/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync } from 'fs';

import { readSchemedJsonFile, writeSchemedJsonFile } from '../../fileUtil';
import { migrateSourcesJson, oldSourcesJsonPath } from './migrateSourcesJson';

jest.mock('fs');
jest.mock('../../fileUtil');

describe('migrating sources.json', () => {
    const mockedExistsSync = jest.mocked(existsSync);
    const mockedReadSchemedJsonFile = jest.mocked(readSchemedJsonFile);
    const mockedWriteSchemedJsonFile = jest.mocked(writeSchemedJsonFile);

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
        mockedReadSchemedJsonFile.mockReturnValue(oldSourceJsonContent);

        // Act
        migrateSourcesJson();

        // Assert
        expect(mockedWriteSchemedJsonFile).toBeCalledWith(
            expect.anything(),
            expect.anything(),
            newSourceVersionedJsonContent
        );
    });

    it('should do nothing if sources.json does not exist', () => {
        mockedExistsSync.mockReturnValue(false);

        migrateSourcesJson();

        expect(mockedReadSchemedJsonFile).not.toBeCalled();
    });

    it('should do nothing if sources-versioned.json already exists', () => {
        mockedExistsSync.mockReturnValue(true);

        migrateSourcesJson();

        expect(mockedReadSchemedJsonFile).not.toBeCalled();
    });
});
