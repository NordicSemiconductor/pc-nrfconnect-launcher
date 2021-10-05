/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

import { findJlinkIds, findParentIdPrefixes } from '../jlink';
import * as reg from '../reg';

describe('findParentIdPrefixes', () => {
    const comName = 'COM1';

    it('should throw error if query fails', () => {
        reg.query = () => Promise.reject(new Error('Foo'));

        return findParentIdPrefixes(comName).catch(error => {
            expect(error).toEqual(error);
        });
    });

    it('should return empty array if query output is empty', () => {
        reg.query = () => Promise.resolve('');

        return findParentIdPrefixes(comName).then(parentIdPrefixes => {
            expect(parentIdPrefixes).toEqual([]);
        });
    });

    it('should return array with one ParentIdPrefix value if one exists in query output', () => {
        reg.query = () =>
            Promise.resolve(`
HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_1366&PID_1015&MI_00\\7&717c78b&0&0000\\Device Parameters
  PortName  REG_SZ  COM1
`);
        return findParentIdPrefixes(comName).then(parentIdPrefixes => {
            expect(parentIdPrefixes).toEqual(['7&717c78b&0']);
        });
    });

    it('should return array with two ParentIdPrefix values if two exist in query output', () => {
        reg.query = () =>
            Promise.resolve(`
HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_1366&PID_1015&MI_00\\7&717c78b&0&0000\\Device Parameters
  PortName  REG_SZ  COM1

HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_1366&PID_1015&MI_00\\1&133712c&0&1234\\Device Parameters
  PortName  REG_SZ  COM1
`);
        return findParentIdPrefixes(comName).then(parentIdPrefixes => {
            expect(parentIdPrefixes).toEqual(['7&717c78b&0', '1&133712c&0']);
        });
    });
});

describe('findJlinkIds', () => {
    it('should throw error if query fails', () => {
        reg.query = () => Promise.reject(new Error('Foo'));

        return findJlinkIds([]).catch(error => {
            expect(error).toEqual(error);
        });
    });

    it('should return empty array if no parentIdPrefix values given, and no query output', () => {
        reg.query = () => Promise.resolve('');

        return findJlinkIds([]).then(jlinkIds => {
            expect(jlinkIds).toEqual([]);
        });
    });

    it('should return empty array if parentIdPrefix is given, but no query output', () => {
        reg.query = () => Promise.resolve('');

        return findJlinkIds(['7&717c78b&0']).then(jlinkIds => {
            expect(jlinkIds).toEqual([]);
        });
    });

    it('should return array with one jlinkId if parentIdPrefix is given, and match exists in query output', () => {
        reg.query = () =>
            Promise.resolve(`
HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_1366&PID_1015\\000680551615
  ParentIdPrefix  REG_SZ  7&717c78b&0
`);
        return findJlinkIds(['7&717c78b&0']).then(jlinkIds => {
            expect(jlinkIds).toEqual(['000680551615']);
        });
    });

    it('should return array with two jlinkIds if parentIdPrefix is given, and two matches exist in query output', () => {
        reg.query = () =>
            Promise.resolve(`
HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_1366&PID_1015\\000680551615
  ParentIdPrefix  REG_SZ  7&717c78b&0

HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_1366&PID_1015\\000613371337
  ParentIdPrefix  REG_SZ  7&717c78b&0
`);
        return findJlinkIds(['7&717c78b&0']).then(jlinkIds => {
            expect(jlinkIds).toEqual(['000680551615', '000613371337']);
        });
    });

    it('should return array with one jlinkId if parentIdPrefix is given, and duplicate match exists in query output', () => {
        reg.query = () =>
            Promise.resolve(`
HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_1366&PID_1015\\000680551615
  ParentIdPrefix  REG_SZ  7&717c78b&0

HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_1366&PID_1015&1337\\000680551615
  ParentIdPrefix  REG_SZ  7&717c78b&0
`);
        return findJlinkIds(['7&717c78b&0']).then(jlinkIds => {
            expect(jlinkIds).toEqual(['000680551615']);
        });
    });

    it('should return array with two jlinkId if two parentIdPrefixes are given, and both exist in query output', () => {
        reg.query = () =>
            Promise.resolve(`
HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_1366&PID_1015\\000680551615
  ParentIdPrefix  REG_SZ  7&717c78b&0

HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\VID_1366&PID_1015\\000613371337
  ParentIdPrefix  REG_SZ  1&133712c&0
`);
        return findJlinkIds(['7&717c78b&0', '1&133712c&0']).then(jlinkIds => {
            expect(jlinkIds).toEqual(['000680551615', '000613371337']);
        });
    });
});
