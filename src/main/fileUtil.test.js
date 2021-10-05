/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

jest.mock('fs-extra', () => ({}));

import { getNameFromNpmPackage } from './fileUtil';

describe('getNameFromNpmPackage', () => {
    it('should return null if path is invalid', () => {
        expect(getNameFromNpmPackage('(invalid)')).toBeNull();
    });

    it('should return null if file name has no no dash', () => {
        expect(getNameFromNpmPackage('/path/to/package.tgz')).toBeNull();
    });

    it('should return name if file name is valid', () => {
        expect(getNameFromNpmPackage('/path/to/my-package-1.2.3.tgz')).toEqual(
            'my-package'
        );
    });
});
