/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    convertToSemver,
    existingIsOlderThanExpected,
    hasExpectedFormat,
    strippedVersionName,
} from './jlinkVersion';

// Note: In this test the space at the end of 'JLink_V7.96 ' is intentional.

test('strippedVersionName', () => {
    expect(
        strippedVersionName({
            version: '7.94i',
            versionFormat: 'string',
        })
    ).toBe('7.94i');
    expect(
        strippedVersionName({
            version: '7.96 ',
            versionFormat: 'string',
        })
    ).toBe('7.96');
});

describe('expectedFormat', () => {
    it('fails if the version format is not string', () => {
        expect(
            hasExpectedFormat({
                versionDependency: {
                    version: 18,
                    versionFormat: 'incremental',
                },
                logFailure: false,
            })
        ).toBe(false);

        expect(
            hasExpectedFormat({
                versionDependency: {
                    version: { major: 1, minor: 2, patch: 3 },
                    versionFormat: 'semantic',
                },
                logFailure: false,
            })
        ).toBe(false);
    });

    it('fails if the content is unexpected', () => {
        const noJlinkPrefix = {
            version: '7.94i',
            versionFormat: 'string',
        } as const;
        expect(
            hasExpectedFormat({
                versionDependency: noJlinkPrefix,
                logFailure: false,
            })
        ).toBe(false);

        const wrongCasing = {
            version: 'jlink_v7.96',
            versionFormat: 'string',
        } as const;
        expect(
            hasExpectedFormat({
                versionDependency: wrongCasing,
                logFailure: false,
            })
        ).toBe(false);

        const unexpectedPostfix = {
            version: 'JLink_V7.96-beta',
            versionFormat: 'string',
        } as const;
        expect(
            hasExpectedFormat({
                versionDependency: unexpectedPostfix,
                logFailure: false,
            })
        ).toBe(false);
    });

    it('succeeds for expected content', () => {
        expect(
            hasExpectedFormat({
                versionDependency: {
                    version: 'JLink_V7.94i',
                    versionFormat: 'string',
                },
                logFailure: false,
            })
        ).toBe(true);
        expect(
            hasExpectedFormat({
                versionDependency: {
                    version: 'JLink_V7.96 ',
                    versionFormat: 'string',
                },
                logFailure: false,
            })
        ).toBe(true);
        expect(
            hasExpectedFormat({
                versionDependency: {
                    version: 'JLink_V8.10',
                    versionFormat: 'string',
                },
                logFailure: false,
            })
        ).toBe(true);
    });
});

test('convertToSemver', () => {
    expect(
        convertToSemver({ version: 'JLink_V7.94', versionFormat: 'string' })
    ).toBe('7.94.0');
    expect(
        convertToSemver({ version: 'JLink_V7.96 ', versionFormat: 'string' })
    ).toBe('7.96.0');
    expect(
        convertToSemver({ version: 'JLink_V7.98a', versionFormat: 'string' })
    ).toBe('7.98.1');
    expect(
        convertToSemver({ version: 'JLink_V8.10b', versionFormat: 'string' })
    ).toBe('8.10.2');
});

describe('existingIsOlderThanExpected', () => {
    const version794i = {
        version: 'JLink_V7.94i',
        versionFormat: 'string',
    } as const;
    const version794k = {
        version: 'JLink_V7.94k',
        versionFormat: 'string',
    } as const;
    const version796 = {
        version: 'JLink_V7.96 ',
        versionFormat: 'string',
    } as const;
    const version810b = {
        version: 'JLink_V8.10b',
        versionFormat: 'string',
    } as const;

    it('is false if no expected is specified', () => {
        expect(
            existingIsOlderThanExpected({ ...version794i, name: 'JlinkARM' })
        ).toBe(false);
    });
    it('is false if the actual is equal the expected', () => {
        expect(
            existingIsOlderThanExpected({
                ...version794i,
                name: 'JlinkARM',
                expectedVersion: version794i,
            })
        ).toBe(false);
    });
    it('is false if the actual is newer than the expected', () => {
        expect(
            existingIsOlderThanExpected({
                ...version794k,
                name: 'JlinkARM',
                expectedVersion: version794i,
            })
        ).toBe(false);
        expect(
            existingIsOlderThanExpected({
                ...version796,
                name: 'JlinkARM',
                expectedVersion: version794i,
            })
        ).toBe(false);
        expect(
            existingIsOlderThanExpected({
                ...version810b,
                name: 'JlinkARM',
                expectedVersion: version794i,
            })
        ).toBe(false);
    });

    it('is true if the actual is older than the expected', () => {
        expect(
            existingIsOlderThanExpected({
                ...version794i,
                name: 'JlinkARM',
                expectedVersion: version794k,
            })
        ).toBe(true);
        expect(
            existingIsOlderThanExpected({
                ...version794i,
                name: 'JlinkARM',
                expectedVersion: version796,
            })
        ).toBe(true);
        expect(
            existingIsOlderThanExpected({
                ...version794i,
                name: 'JlinkARM',
                expectedVersion: version810b,
            })
        ).toBe(true);
    });
});
