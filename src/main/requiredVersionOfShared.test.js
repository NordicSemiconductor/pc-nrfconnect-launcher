/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import requiredVersionOfShared from './requiredVersionOfShared';

const basePackageJson = {
    name: 'test-package',
    version: '0.0.0.0-test',
};

describe('getting the version of pc-nrfconnect-shared an app requires', () => {
    it('should return undefined if there is no such dependency', () => {
        expect(requiredVersionOfShared(basePackageJson)).toBeUndefined();
    });

    it('should find the version if it is in the dependencies', () => {
        expect(
            requiredVersionOfShared({
                ...basePackageJson,
                dependencies: {
                    'pc-nrfconnect-shared':
                        'github:NordicSemiconductor/pc-nrfconnect-shared#v4.19.0',
                },
            })
        ).toBe('v4.19.0');
    });

    it('should find the version if it is in the devDependencies', () => {
        expect(
            requiredVersionOfShared({
                ...basePackageJson,
                devDependencies: {
                    'pc-nrfconnect-shared':
                        'github:NordicSemiconductor/pc-nrfconnect-shared#v4.19.0',
                },
            })
        ).toBe('v4.19.0');
    });

    it('should remove a leading "semver:"', () => {
        expect(
            requiredVersionOfShared({
                ...basePackageJson,
                devDependencies: {
                    'pc-nrfconnect-shared':
                        'github:NordicSemiconductor/pc-nrfconnect-shared#semver:4.19.0',
                },
            })
        ).toBe('4.19.0');
    });

    it('should leading ~ or ^ for a semver', () => {
        expect(
            requiredVersionOfShared({
                ...basePackageJson,
                devDependencies: {
                    'pc-nrfconnect-shared':
                        'github:NordicSemiconductor/pc-nrfconnect-shared#semver:^4.19.0',
                },
            })
        ).toBe('4.19.0');

        expect(
            requiredVersionOfShared({
                ...basePackageJson,
                devDependencies: {
                    'pc-nrfconnect-shared':
                        'github:NordicSemiconductor/pc-nrfconnect-shared#semver:~4.19.0',
                },
            })
        ).toBe('4.19.0');
    });
});
