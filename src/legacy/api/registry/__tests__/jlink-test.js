/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint-disable import/first */

import * as reg from '../reg';
import { findParentIdPrefixes, findJlinkIds } from '../jlink';

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
