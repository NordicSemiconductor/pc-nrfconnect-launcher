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

import {
    parseVariableLine,
    parseResult,
    parseResults,
    parseMatchingKeys,
    parseParentIdPrefix,
    parseJlinkId,
} from '../parsing';

const REGISTRY_USB_PATH =
    'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB';

describe('parseVariableLine', () => {
    it('should return empty object if line is empty', () => {
        const line = '';
        expect(parseVariableLine(line)).toEqual({});
    });

    it('should return empty object if line contains less than 3 parts', () => {
        const line = '  part1  part2  ';
        expect(parseVariableLine(line)).toEqual({});
    });

    it('should return empty object if value type is not string (REG_SZ)', () => {
        const line = '  part1  REG_X  part2  ';
        expect(parseVariableLine(line)).toEqual({});
    });

    it('should return object with name and value if line has three parts and value type is string', () => {
        const line = '  part1  REG_SZ  part2  ';
        expect(parseVariableLine(line)).toEqual({
            name: 'part1',
            value: 'part2',
        });
    });
});

describe('parseResult', () => {
    it('should return empty object if result is empty', () => {
        const result = '';
        expect(parseResult(result)).toEqual({});
    });

    it('should return empty object if result is less than two lines', () => {
        const result = `${REGISTRY_USB_PATH}`;
        expect(parseResult(result)).toEqual({});
    });

    it('should return empty object if result does not begin with registry USB path', () => {
        const result = 'foo\n';
        expect(parseResult(result)).toEqual({});
    });

    it('should return empty object if result contains only the key', () => {
        const result = `${REGISTRY_USB_PATH}\\Foo\n`;
        expect(parseResult(result)).toEqual({});
    });

    it('should return object with key and values if result contains key and values', () => {
        const result = `${REGISTRY_USB_PATH}\\Foo\n  foo  REG_SZ  bar  \n  foo2 REG_SZ bar2`;
        expect(parseResult(result)).toEqual({
            key: `${REGISTRY_USB_PATH}\\Foo`,
            values: [
                { name: 'foo', value: 'bar' },
                { name: 'foo2', value: 'bar2' },
            ],
        });
    });
});

describe('parseResults', () => {
    it('should return no results if reg.exe output is empty', () => {
        const regOutput = '';
        expect(parseResults(regOutput)).toEqual([]);
    });

    it('should return one result if reg.exe output contains one result', () => {
        const regOutput = `${REGISTRY_USB_PATH}\\Foo\n foo REG_SZ bar \n`;
        expect(parseResults(regOutput)).toEqual([
            {
                key: `${REGISTRY_USB_PATH}\\Foo`,
                values: [{ name: 'foo', value: 'bar' }],
            },
        ]);
    });

    it('should return two results if reg.exe output contains two results', () => {
        const regOutput =
            `${REGISTRY_USB_PATH}\\Foo\n` +
            'foo REG_SZ bar\n' +
            'baz REG_SZ test\n' +
            '\n' +
            `${REGISTRY_USB_PATH}\\Bar\n` +
            'bar REG_SZ foobar\n' +
            'foo REG_SZ test\n';
        expect(parseResults(regOutput)).toEqual([
            {
                key: `${REGISTRY_USB_PATH}\\Foo`,
                values: [
                    { name: 'foo', value: 'bar' },
                    { name: 'baz', value: 'test' },
                ],
            },
            {
                key: `${REGISTRY_USB_PATH}\\Bar`,
                values: [
                    { name: 'bar', value: 'foobar' },
                    { name: 'foo', value: 'test' },
                ],
            },
        ]);
    });
});

describe('parseMatchingKeys', () => {
    it('should return no matching keys if reg.exe output is empty', () => {
        const regOutput = '';
        const name = 'foo';
        const value = 'bar';

        expect(parseMatchingKeys(regOutput, name, value)).toEqual([]);
    });

    it('should return no matching keys if reg.exe output contains results, but no match', () => {
        const regOutput =
            `${REGISTRY_USB_PATH}\\Foo\n` +
            'foobar REG_SZ baz\n' +
            'baz REG_SZ test\n' +
            '\n' +
            `${REGISTRY_USB_PATH}\\Bar\n` +
            'bar REG_SZ foobar\n' +
            'foo REG_SZ test\n';
        const name = 'foo';
        const value = 'bar';

        expect(parseMatchingKeys(regOutput, name, value)).toEqual([]);
    });

    it('should return one matching key if reg.exe output contains one result with match', () => {
        const regOutput =
            `${REGISTRY_USB_PATH}\\Foo\n` +
            'foobar REG_SZ baz\n' +
            'foo REG_SZ bar\n' +
            '\n' +
            `${REGISTRY_USB_PATH}\\Bar\n` +
            'bar REG_SZ foobar\n' +
            'foo REG_SZ test\n';
        const name = 'foo';
        const value = 'bar';

        expect(parseMatchingKeys(regOutput, name, value)).toEqual([
            `${REGISTRY_USB_PATH}\\Foo`,
        ]);
    });
});

describe('parseParentIdPrefix', () => {
    it('should return null if key is empty', () => {
        const key = '';
        expect(parseParentIdPrefix(key)).toEqual(null);
    });

    it('should return null if the parentId part does not have an ampersand character', () => {
        const key =
            'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\' +
            'VID_1366&PID_1015&MI_00\\parentIdWithoutAmpersand';
        expect(parseParentIdPrefix(key)).toEqual(null);
    });

    it('should return parentIdPrefix value if key contains parentIdPrefix', () => {
        const key =
            'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\' +
            'VID_1366&PID_1015&MI_00\\7&717c78b&0&0000\\Device Parameters';
        expect(parseParentIdPrefix(key)).toEqual('7&717c78b&0');
    });
});

describe('parseJlinkId', () => {
    it('should return null if key is empty', () => {
        const key = '';
        expect(parseJlinkId(key)).toEqual(null);
    });

    it('should return jlinkId value if key contains jlinkId', () => {
        const key =
            'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Enum\\USB\\' +
            'VID_1366&PID_1015\\000680551615';
        expect(parseJlinkId(key)).toEqual('000680551615');
    });
});
