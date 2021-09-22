/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    parseJlinkId,
    parseMatchingKeys,
    parseParentIdPrefix,
    parseResult,
    parseResults,
    parseVariableLine,
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
