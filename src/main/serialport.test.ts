/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { OverwriteOptions } from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import { MockBinding } from '@serialport/binding-mock';
import { UpdateOptions } from '@serialport/bindings-cpp';
import { SerialPortStream as MockSerialPortStream } from '@serialport/stream';

import {
    closeSerialPort,
    getBaudRate,
    getOptions,
    isOpen,
    openOrAdd,
    update,
    writeToSerialport,
} from './serialport';
import { Renderer, serialPorts } from './serialportMap';

const testPortPath = '/dev/ROBOT';

const defaultOptions = { path: testPortPath, baudRate: 115200, xany: true };
const defaultOverwriteOptions: OverwriteOptions = {
    overwrite: false,
    settingsLocked: false,
};

jest.mock('serialport', () => {
    const MockSerialPort = new Proxy(MockSerialPortStream, {
        construct(Target, args) {
            const [options] = args;
            return new Target({
                path: testPortPath,
                binding: MockBinding,
                ...options,
            });
        },
    });
    return {
        SerialPort: MockSerialPort,
    };
});

let rendererId = 0;
const createMockSender = (): Renderer => ({
    // eslint-disable-next-line no-plusplus
    id: rendererId++,
    on: jest.fn(),
    send: jest.fn(),
});

const flushMacroTaskQueue = () =>
    new Promise(resolve => {
        setTimeout(resolve);
    });

beforeEach(() => {
    // Cleanup between each test.
    serialPorts.clear();
    MockBinding.reset();
    MockBinding.createPort(testPortPath, {
        echo: true,
        record: true,
    });
});

describe('Single renderer', () => {
    let renderer: Renderer;

    beforeEach(() => {
        renderer = createMockSender();
    });

    test('writes to a port', async () => {
        await openOrAdd(renderer, defaultOptions, defaultOverwriteOptions);

        writeToSerialport(testPortPath, 'OK');
        await flushMacroTaskQueue();

        expect(renderer.send).toHaveBeenCalledWith(
            `serialport:on-data_${defaultOptions.path}`,
            Buffer.from('OK')
        );
    });

    test('writing to the port before it is open should throw', async () => {
        const openPromise = openOrAdd(
            renderer,
            defaultOptions,
            defaultOverwriteOptions
        );
        expect(() => writeToSerialport(testPortPath, 'Test')).toThrow(
            'PORT_NOT_OPEN'
        );
        // Must wait for the port to actually open, in order to again close it.
        await openPromise;
    });
});

describe('Two renderers', () => {
    let rendererOne: Renderer;
    let rendererTwo: Renderer;

    beforeEach(() => {
        rendererOne = createMockSender();
        rendererTwo = createMockSender();
    });

    test('opening one serialport with two renderers should work', async () => {
        await expect(
            openOrAdd(rendererOne, defaultOptions, defaultOverwriteOptions)
        ).resolves.toBeUndefined();

        await expect(
            openOrAdd(rendererTwo, defaultOptions, defaultOverwriteOptions)
        ).resolves.toBeUndefined();

        await closeSerialPort(rendererOne, testPortPath);

        // Having closed with one renderer, should still keep port open
        // as long as there are renderers that are subscribed to the port.
        expect(isOpen(testPortPath)).toBe(true);
        // Closing the same serialport several times does nothing...
        await closeSerialPort(rendererOne, testPortPath);
        expect(isOpen(testPortPath)).toBe(true);

        await closeSerialPort(rendererTwo, testPortPath);
        // Having closed the port with all renderers, the port should be closed
        expect(() => isOpen(testPortPath)).toThrow('PORT_NOT_FOUND');
        // Closing the same port when it has been deleted throws an error.
        await expect(
            // eslint-disable-next-line no-return-await -- We want to wrap this in async/await to simulate the way this will be turned into a promise anyhow when invoked by IPC
            async () => await closeSerialPort(rendererTwo, testPortPath)
        ).rejects.toThrow('PORT_NOT_FOUND');
    });

    test('baudRate may be updated whilst port is open, and is renderer-independent', async () => {
        await expect(
            openOrAdd(rendererOne, defaultOptions, defaultOverwriteOptions)
        ).resolves.toBeUndefined();

        await expect(
            openOrAdd(rendererTwo, defaultOptions, defaultOverwriteOptions)
        ).resolves.toBeUndefined();

        const baudRatesToTest = [
            57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200,
            150, 134, 110, 75, 50, 115200,
        ];

        // eslint-disable-next-line no-restricted-syntax
        for (const rate of baudRatesToTest) {
            expect(
                // eslint-disable-next-line no-await-in-loop
                await update(testPortPath, { baudRate: rate } as UpdateOptions)
            ).toBeUndefined();
            expect(getBaudRate(testPortPath)).toBe(rate);
        }
    });

    test('opening the same port at the same time should throw', async () => {
        const promise = openOrAdd(
            rendererOne,
            defaultOptions,
            defaultOverwriteOptions
        );
        await expect(
            openOrAdd(rendererTwo, defaultOptions, defaultOverwriteOptions)
        ).rejects.toThrow('PORT_IS_ALREADY_BEING_OPENED');

        // Wait for the first open to finish.
        await promise;
    });

    test('with the second renderer providing the overwrite flag decides if the port options should be overwritten', async () => {
        await expect(
            openOrAdd(rendererOne, defaultOptions, defaultOverwriteOptions)
        ).resolves.toBeUndefined();

        await expect(
            openOrAdd(
                rendererTwo,
                { path: testPortPath, baudRate: 9600 },
                defaultOverwriteOptions
            )
        ).rejects.toThrow('FAILED_DIFFERENT_SETTINGS');

        // remove property (xon) is also different
        await expect(
            openOrAdd(
                rendererTwo,
                { path: testPortPath, baudRate: 115200 },
                defaultOverwriteOptions
            )
        ).rejects.toThrow('FAILED_DIFFERENT_SETTINGS');

        await expect(
            openOrAdd(
                rendererTwo,
                { path: testPortPath, baudRate: 9600 },
                { overwrite: true, settingsLocked: false }
            )
        ).resolves.toBeUndefined();
    });

    test('cannot overwrite the settings of the first when settings are locked.', async () => {
        await openOrAdd(rendererOne, defaultOptions, {
            ...defaultOverwriteOptions,
            settingsLocked: true,
        });

        await expect(
            openOrAdd(
                rendererTwo,
                { ...defaultOptions, stopBits: 2 },
                defaultOverwriteOptions
            )
        ).rejects.toThrow('FAILED_SETTINGS_LOCKED');
        await expect(
            openOrAdd(
                rendererTwo,
                { ...defaultOptions, stopBits: 2, parity: 'odd' },
                { ...defaultOverwriteOptions, overwrite: true }
            )
        ).rejects.toThrow('FAILED_SETTINGS_LOCKED');
    });

    test('can still subscribe to port with the same settings, even though settings are locked.', async () => {
        await openOrAdd(rendererOne, defaultOptions, {
            ...defaultOverwriteOptions,
            settingsLocked: true,
        });

        await expect(
            openOrAdd(rendererTwo, defaultOptions, defaultOverwriteOptions)
        ).resolves.toBe(undefined);

        await expect(
            openOrAdd(rendererTwo, defaultOptions, {
                ...defaultOverwriteOptions,
                overwrite: true,
            })
        ).resolves.toBe(undefined);
    });

    test('write from renderer A will forward the written data to renderer A and B', async () => {
        await openOrAdd(rendererOne, defaultOptions, defaultOverwriteOptions);
        await openOrAdd(rendererTwo, defaultOptions, defaultOverwriteOptions);
        const terminalData = 'TestData';
        writeToSerialport(testPortPath, terminalData);

        await flushMacroTaskQueue();

        expect(rendererOne.send).toHaveBeenCalledWith(
            `serialport:on-write_${defaultOptions.path}`,
            terminalData
        );
        expect(rendererTwo.send).toHaveBeenCalledWith(
            `serialport:on-write_${defaultOptions.path}`,
            terminalData
        );
    });

    test('gets the correct options', async () => {
        expect(getOptions(testPortPath)).toBeUndefined();

        await openOrAdd(rendererOne, defaultOptions, defaultOverwriteOptions);
        expect(getOptions(testPortPath)).toEqual(defaultOptions);

        await update(testPortPath, { baudRate: 9600 });
        expect(getOptions(testPortPath)).toEqual({
            ...defaultOptions,
            baudRate: 9600,
        });

        const newOptions = { ...defaultOptions, xany: false };
        await openOrAdd(rendererTwo, newOptions, {
            ...defaultOverwriteOptions,
            overwrite: true,
        });
        expect(getOptions(testPortPath)).toEqual(newOptions);

        await closeSerialPort(rendererOne, testPortPath);
        await closeSerialPort(rendererTwo, testPortPath);

        expect(getOptions(testPortPath)).toBeUndefined();
    });
});
