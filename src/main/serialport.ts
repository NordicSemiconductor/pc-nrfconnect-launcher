/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AutoDetectTypes, SetOptions } from '@serialport/bindings-cpp';
import { Renderer, WebContents } from 'electron';
import { SERIALPORT_CHANNEL } from 'pc-nrfconnect-shared/main';
import { SerialPort, SerialPortOpenOptions } from 'serialport';

import { logger } from './log';

export type Renderer = Pick<WebContents, 'on' | 'send' | 'id'>;

/**
 *  serialPorts: {

        '/dev/Robot': {
            renderers: Renderer[],
            serialPort: SerialPort,
        },

        '/dev/Rowboat': {
            renderers: Renderer[],
            serialPort: SerialPort,
        }
    }
*/
type OpenPort = {
    serialPort: SerialPort;
    renderers: Renderer[];
    settingsLocked: boolean;
    opening: boolean;
};

const serialPorts = new Map<string, OpenPort>();

export const openOrAdd = async (
    sender: Renderer,
    options: SerialPortOpenOptions<AutoDetectTypes>,
    overwrite: boolean
) => {
    const { path } = options;
    const existingPort = serialPorts.get(path);

    if (existingPort) {
        // Port is already opened

        if (existingPort.opening) {
            throw new Error('PORT_IS_ALREADY_BEING_OPENED');
        }

        const renderers = existingPort.renderers;
        const alreadyInList = renderers.find(
            existing => sender.id === existing.id
        );

        if (!alreadyInList) {
            let isDifferentSettings;
            if (existingPort.serialPort) {
                const currentOptions = existingPort.serialPort.settings;
                Object.entries(options).forEach(([key, value]) => {
                    if (
                        !(key in currentOptions) ||
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (currentOptions as any)[key] !== value
                    ) {
                        isDifferentSettings = true;
                    }
                });
            }

            if (isDifferentSettings) {
                if (!overwrite) {
                    throw new Error('FAILED_DIFFERENT_SETTINGS');
                }

                const result = await changeOptions(options);
                if (result === 'FAILED') {
                    throw new Error('FAILED');
                }
                existingPort.renderers.forEach(renderer => {
                    renderer.send(SERIALPORT_CHANNEL.ON_CHANGED, options);
                });
            }
            renderers.push(sender);
            addSenderEvents(path, sender);
        }
        return;
    }

    await openNewSerialPort(options)
        .then(() => {
            const openPort = serialPorts.get(path);
            openPort?.renderers.push(sender);
            addSenderEvents(path, sender);
        })
        .catch(() => {
            throw new Error('FAILED');
        });
};

export const writeToSerialport = (
    path: string,
    sender: Renderer,
    data: string | number[] | Buffer
) => {
    const openPort = serialPorts.get(path);
    if (!openPort) {
        throw new Error('PORT_NOT_FOUND');
    }

    if (!openPort.serialPort.isOpen) {
        throw new Error('PORT_NOT_OPEN');
    }

    openPort.renderers
        .filter(renderer => renderer.id !== sender.id)
        .forEach(renderer => renderer.send('serialport:on-write', data));

    return new Promise<void>((resolve, reject) => {
        openPort.serialPort.write(data, error => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
};

const onData = (path: string, chunk: unknown) => {
    const openPort = serialPorts.get(path);
    if (openPort) {
        openPort.renderers.forEach(renderer =>
            renderer.send(SERIALPORT_CHANNEL.ON_DATA, chunk)
        );
    }
};

export const isOpen = (path: string): boolean => {
    const port = serialPorts.get(path)?.serialPort;
    if (!port) {
        return false;
    }

    return port.isOpen;
};

/* Return true if port is closed, false otherwise */
export const closeSerialPort = (
    path: string,
    sender: Renderer
): [Error | undefined, boolean] => {
    const port = serialPorts.get(path)?.serialPort;
    let portWasClosed = false;
    if (!port) {
        return [
            Error(
                `Could not find SerialPort with path ${path}, and could not be closed.`
            ),
            portWasClosed,
        ];
    }

    const renderers = serialPorts.get(path)?.renderers;
    if (renderers) {
        // FIXME: Issue is I can't get the potential Error from port.close().
        // removeRenderer will close the port and return true if list of renderers is empty after removing sender.
        portWasClosed = removeRenderer(path, sender);
    }
    return [undefined, portWasClosed];
};

const removeRenderer = (path: string, sender: Renderer): boolean => {
    let closedPort = false;
    const openPort = serialPorts.get(path);
    if (openPort) {
        openPort.renderers = openPort.renderers.filter(
            renderer => renderer.id !== sender.id
        );

        if (openPort.renderers.length === 0) {
            if (openPort.serialPort.isOpen) {
                openPort.serialPort.close();
                serialPorts.delete(path);
                closedPort = true;
            }
        } else {
            serialPorts.set(path, openPort);
        }
    }
    return closedPort;
};

export const update = (path: string, baudRate: number) => {
    const openPort = serialPorts.get(path);

    if (!openPort) {
        return;
    }

    const { serialPort, renderers } = openPort;

    return new Promise<void>((resolve, reject) => {
        serialPort.update({ baudRate }, error => {
            if (error) {
                reject(error);
            }
            renderers.forEach(renderer => {
                renderer.send(
                    SERIALPORT_CHANNEL.ON_UPDATE,
                    serialPort.settings
                );
            });
            resolve();
        });
    });
};

export const set = (path: string, newOptions: SetOptions) => {
    const openPort = serialPorts.get(path);

    if (!openPort) {
        return;
    }

    const { serialPort, renderers } = openPort;

    serialPort.set(newOptions);

    renderers.forEach(renderer => {
        // TODO: Review if we actually want to send newOptions?
        // You also have a get() function, but it's only a subset of SetOptions, called PortStatus
        renderer.send(SERIALPORT_CHANNEL.ON_SET, newOptions);
    });
};

const openNewSerialPort = (options: SerialPortOpenOptions<AutoDetectTypes>) => {
    const { path } = options;
    const openPort = serialPorts.get(path);
    if (openPort && openPort.serialPort.isOpen) {
        openPort.serialPort.close();
    }

    const newOpenPort: OpenPort = {
        ...openPort,
        serialPort: new SerialPort({ ...options, path, autoOpen: false }),
        renderers: openPort?.renderers ?? [],
        settingsLocked: false,
        opening: true,
    };
    serialPorts.set(path, newOpenPort);

    const { serialPort: port } = newOpenPort;

    port.on('data', data => {
        onData(path, data);
    });

    port.on('close', (error: Error) => {
        // Device powers off, or is closed manually: do a clean up
        if (error) {
            newOpenPort.renderers.forEach(renderer => {
                renderer.send(SERIALPORT_CHANNEL.ON_CLOSED);
            });
            serialPorts.delete(path);
        }
    });

    return new Promise<void>((resolve, reject) => {
        port.open(err => {
            if (err) {
                reject(Error('FAILED'));
            }
            newOpenPort.opening = false;
            resolve();
        });
    });
};

export const changeOptions = async (
    options: SerialPortOpenOptions<AutoDetectTypes>
) => {
    const openPort = serialPorts.get(options.path);
    if (!openPort) {
        return 'FAILED';
    }

    const result = await openNewSerialPort(options);
    return result;
};

export const getSettings = (path: string): number | void => {
    const openPort = serialPorts.get(path);
    if (!openPort) {
        return;
    }
    return openPort.serialPort.baudRate;
};

const addSenderEvents = (path: string, sender: Renderer) => {
    // Remove renderer if renderer process is destroyed (window is closed).
    sender.on('destroyed', () => {
        logger.info(
            `SerialPort: Port with path=${path} have removed renderer with id=${sender.id} because renderer was destroyed.`
        );
        removeRenderer(path, sender);
    });

    // Remove renderer if renderer window is reloaded
    sender.on('did-finish-load', () => {
        logger.info(
            `SerialPort: Port with path=${path} have removed renderer with id=${sender.id} because renderer reloaded window.`
        );
        removeRenderer(path, sender);
    });
};
