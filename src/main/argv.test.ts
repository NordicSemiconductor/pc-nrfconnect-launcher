/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { mergeAppArguments } from './argv';

describe('mergeAppArguments', () => {
    it('leaves the args unchanged if no open app options are provided', () => {
        const args = ['--deviceSerial', '001122', '--otherArg'];
        expect(mergeAppArguments(args)).toEqual(args);
    });

    it('removes --deviceSerial if any device is specified', () => {
        const args = ['--deviceSerial', '001122', '--otherArg'];

        expect(
            mergeAppArguments(args, { device: { serialNumber: '334455' } }),
        ).toEqual(['--otherArg', '--deviceSerial', '334455']);
        expect(
            mergeAppArguments(args, { device: { serialPortPath: 'COM0' } }),
        ).toEqual(['--otherArg', '--comPort', 'COM0']);
    });

    it('removes --comPort if any device is specified', () => {
        const args = ['--comPort', 'COM2', '--otherArg'];

        expect(
            mergeAppArguments(args, { device: { serialNumber: '334455' } }),
        ).toEqual(['--otherArg', '--deviceSerial', '334455']);
        expect(
            mergeAppArguments(args, { device: { serialPortPath: 'COM0' } }),
        ).toEqual(['--otherArg', '--comPort', 'COM0']);
    });

    it('even though that should not happen it handles a trailing --deviceSerial correctly', () => {
        const args = ['--comPort', 'COM2', '--deviceSerial'];

        expect(
            mergeAppArguments(args, { device: { serialNumber: '334455' } }),
        ).toEqual(['--deviceSerial', '334455']);
        expect(
            mergeAppArguments(args, { device: { serialPortPath: 'COM0' } }),
        ).toEqual(['--comPort', 'COM0']);
    });
});
