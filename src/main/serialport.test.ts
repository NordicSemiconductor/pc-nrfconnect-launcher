/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { MockBinding } from '@serialport/binding-mock';
import { SerialPortStream as MockSerialPortStream } from '@serialport/stream';
import { SERIALPORT_CHANNEL } from 'pc-nrfconnect-shared/main';

import {
    closeSerialPort,
    getSettings,
    isOpen,
    openOrAdd,
    Renderer,
    update,
    writeToSerialport,
} from './serialport';

const testPortPath = '/dev/ROBOT';

const defaultOptions = { path: testPortPath, baudRate: 115200 };

MockBinding.createPort(testPortPath, { echo: true, record: true });

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

describe('Single renderer', () => {
    let renderer: Renderer;

    beforeEach(() => {
        renderer = createMockSender();
    });

    afterEach(() => {
        closeSerialPort(testPortPath, renderer);
    });

    test('writes to a port', async () => {
        await openOrAdd(renderer, defaultOptions, false);

        writeToSerialport(testPortPath, renderer, 'OK');
        await flushMacroTaskQueue();

        expect(renderer.send).toHaveBeenCalledWith(
            SERIALPORT_CHANNEL.ON_DATA,
            Buffer.from('OK')
        );
    });

    test('writing to the port before it is open should throw', async () => {
        const openPromise = openOrAdd(renderer, defaultOptions, false);
        expect(() => writeToSerialport(testPortPath, renderer, 'Test')).toThrow(
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

    afterEach(() => {
        // if (isOpen(testPortPath)) {
        closeSerialPort(testPortPath, rendererOne);
        closeSerialPort(testPortPath, rendererTwo);
        // }
    });

    test('opening one serialport with two renderers should work', async () => {
        await expect(
            openOrAdd(rendererOne, defaultOptions, false)
        ).resolves.toBeUndefined();

        await expect(
            openOrAdd(rendererTwo, defaultOptions, false)
        ).resolves.toBeUndefined();

        const [error, didClose] = closeSerialPort(testPortPath, rendererOne);
        expect(error).toBeUndefined();
        expect(didClose).toBe(false);
        // Having closed with one renderer, should still keep port open
        // as long as there are renderers that are subcribed to the port.
        expect(isOpen(testPortPath)).toBe(true);
        // Closing the same serialport several times does nothing...
        closeSerialPort(testPortPath, rendererOne);
        closeSerialPort(testPortPath, rendererOne);
        expect(isOpen(testPortPath)).toBe(true);

        expect(closeSerialPort(testPortPath, rendererTwo)).toEqual([
            undefined,
            true,
        ]);
        // Having closed the port with all renderers, the port should be closed
        expect(isOpen(testPortPath)).toBe(false);
        // Closing the same serialport several times after it is closed, still does nothing...
        closeSerialPort(testPortPath, rendererTwo); // Returns an error... maybe it should throw?
        closeSerialPort(testPortPath, rendererTwo);
        closeSerialPort(testPortPath, rendererTwo);
        expect(isOpen(testPortPath)).toBe(false);
    });

    test('baudRate may be updated whilst port is open, and is renderer-independent', async () => {
        await expect(
            openOrAdd(rendererOne, defaultOptions, false)
        ).resolves.toBeUndefined();

        await expect(
            openOrAdd(rendererTwo, defaultOptions, false)
        ).resolves.toBeUndefined();

        const baudRatesToTest = [
            57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200,
            150, 134, 110, 75, 50, 115200,
        ];

        // eslint-disable-next-line no-restricted-syntax
        for (const rate of baudRatesToTest) {
            // eslint-disable-next-line no-await-in-loop
            expect(await update(testPortPath, rate)).toBeUndefined();
            expect(getSettings(testPortPath)).toBe(rate);
        }
    });

    test('opening the same port at the same time should throw', async () => {
        const promise = openOrAdd(rendererOne, defaultOptions, false);
        await expect(
            openOrAdd(rendererTwo, defaultOptions, false)
        ).rejects.toThrow('PORT_IS_ALREADY_BEING_OPENED');

        // Wait for the first open to finish.
        await promise;
    });

    test('with the second renderer providing the overwrite flag decides if the port options should be overwritten', async () => {
        await expect(
            openOrAdd(rendererOne, defaultOptions, false)
        ).resolves.toBeUndefined();

        await expect(
            openOrAdd(
                rendererTwo,
                { path: testPortPath, baudRate: 9600 },
                false
            )
        ).rejects.toThrow('FAILED_DIFFERENT_SETTINGS');

        await expect(
            openOrAdd(rendererTwo, { path: testPortPath, baudRate: 9600 }, true)
        ).resolves.toBeUndefined();
    });
});

describe('Two renderers with one serialport open:', () => {
    let rendererOne: Renderer;
    let rendererTwo: Renderer;

    beforeEach(async () => {
        rendererOne = createMockSender();
        rendererTwo = createMockSender();
        await openOrAdd(rendererOne, defaultOptions, false);
        await openOrAdd(rendererTwo, defaultOptions, false);
    });

    afterEach(() => {
        // if (isOpen(testPortPath)) {
        closeSerialPort(testPortPath, rendererOne);
        closeSerialPort(testPortPath, rendererTwo);
        // }
    });

    test('write from renderer A will also notify renderer B', async () => {
        const terminalData = 'TestData';
        writeToSerialport(testPortPath, rendererOne, terminalData);

        await flushMacroTaskQueue();

        expect(rendererTwo.send).toBeCalled();
        expect(rendererTwo.send).toHaveBeenCalledWith(
            'serialport:on-write',
            terminalData
        );
    });
});

// Single renderer writes to a port
// Single renderer disconnects by user
// Single renderer disconnects by device
// Single renderer destroyed

// Multiple renderers open a port
// Multiple renderers, one disconnects, other renderer still reads
// Multiple renderers disconnects by device
// Multiple renderers, one renderer is destroyed
