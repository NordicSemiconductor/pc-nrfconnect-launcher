/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    AutoDetectTypes,
    SetOptions,
    UpdateOptions,
} from '@serialport/bindings-cpp';
import {
    OverwriteOptions,
    SERIALPORT_CHANNEL,
} from 'pc-nrfconnect-shared/main';
import { SerialPort, SerialPortOpenOptions } from 'serialport';

import { logger } from './log';
import { OpenPort, Renderer, serialPorts } from './serialportMap';

enum ErrorId {
    PORT_IS_ALREADY_BEING_OPENED = 'PORT_IS_ALREADY_BEING_OPENED',
    FAILED_SETTINGS_LOCKED = 'FAILED_SETTINGS_LOCKED',
    FAILED_DIFFERENT_SETTINGS = 'FAILED_DIFFERENT_SETTINGS',
    PORT_NOT_FOUND = 'PORT_NOT_FOUND',
    PORT_NOT_OPEN = 'PORT_NOT_OPEN',
    FAILED = 'FAILED',
}

const logInfo = (path: string, message: string) => {
    logger.info(`SerialPort: (${path}) ${message}`);
};

const fail = (path: string, message: string) => {
    logger.error(`SerialPort: (${path}) ${message}`);
};

const failAddingRenderer = (
    path: string,
    sender: Renderer,
    message: string,
    errorId: ErrorId
) => {
    logger.warn(
        `SerialPort: (${path}) Rejected renderer (${sender.id}): ${message}`
    );
    throw new Error(errorId);
};

export const openOrAdd = async (
    sender: Renderer,
    options: SerialPortOpenOptions<AutoDetectTypes>,
    { overwrite = false, settingsLocked = false }: OverwriteOptions
) => {
    const { path } = options;
    const existingPort = serialPorts.get(path);
    if (existingPort) {
        await addRenderer(existingPort, sender, options, {
            overwrite,
            settingsLocked,
        });
        return;
    }

    try {
        const openPort = await openNewSerialPort(options, settingsLocked);
        addSender(path, sender, openPort);
    } catch (error) {
        throw new Error(ErrorId.FAILED);
    }
};

const addRenderer = async (
    existingPort: OpenPort,
    sender: Renderer,
    options: SerialPortOpenOptions<AutoDetectTypes>,
    { overwrite, settingsLocked }: Required<OverwriteOptions>
) => {
    const { path } = options;
    if (existingPort.opening) {
        failAddingRenderer(
            path,
            sender,
            'Port is being opened by another renderer',
            ErrorId.PORT_IS_ALREADY_BEING_OPENED
        );
    }

    const alreadyInList = existingPort.renderers.some(
        renderer => renderer.id === sender.id
    );

    if (!alreadyInList) {
        if (!serialPorts.hasEqualOptions(path, options)) {
            if (existingPort.settingsLocked) {
                failAddingRenderer(
                    path,
                    sender,
                    'Port is open with different, locked settings',
                    ErrorId.FAILED_SETTINGS_LOCKED
                );
            }
            if (!overwrite) {
                failAddingRenderer(
                    path,
                    sender,
                    'Port is open with different settings',
                    ErrorId.FAILED_DIFFERENT_SETTINGS
                );
            }

            const result = await changeOptions(options, settingsLocked);
            if (result === ErrorId.FAILED) {
                throw new Error(ErrorId.FAILED);
            }
            serialPorts.broadCast(path, SERIALPORT_CHANNEL.ON_CHANGED, options);
        }
        addSender(path, sender, existingPort);
        logInfo(path, `Added renderer (${sender.id})`);
    }
};

export const writeToSerialport = (path: string, data: string) => {
    const openPort = serialPorts.get(path);
    if (!openPort) {
        fail(path, 'Failed to set new options, port not found');
        throw new Error(ErrorId.PORT_NOT_FOUND);
    }

    if (!openPort.serialPort.isOpen) {
        fail(path, 'Failed to set new options, port not open');
        throw new Error(ErrorId.PORT_NOT_OPEN);
    }

    serialPorts.broadCast(path, SERIALPORT_CHANNEL.ON_WRITE, data);

    return new Promise<void>((resolve, reject) => {
        openPort.serialPort.write(data, error => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
};

const onData = (path: string, data: unknown) => {
    serialPorts.broadCast(path, SERIALPORT_CHANNEL.ON_DATA, data);
};

export const isOpen = (path: string): boolean => {
    const port = serialPorts.get(path)?.serialPort;
    if (!port) {
        fail(path, 'Queried port not found');
        throw new Error(ErrorId.PORT_NOT_FOUND);
    }
    return port.isOpen;
};

/* Return true if port is closed, false otherwise */
export const closeSerialPort = async (
    sender: Renderer,
    path: string
): Promise<void> => {
    const openPort = serialPorts.get(path);
    if (!openPort) {
        fail(path, 'Cannot close port, was not found');
        throw new Error(ErrorId.PORT_NOT_FOUND);
    }

    await removeRenderer(path, sender);
};

const removeRenderer = async (
    path: string,
    sender: Renderer
): Promise<void> => {
    const openPort = serialPorts.get(path);
    if (openPort) {
        openPort.renderers = openPort.renderers.filter(
            renderer => renderer.id !== sender.id
        );
        serialPorts.set(path, openPort);
        logInfo(path, `Removed renderer (${sender.id})`);

        if (openPort.renderers.length === 0) {
            if (openPort.serialPort.isOpen) {
                logInfo(path, `Will close port`);
                await new Promise<void>(resolve => {
                    openPort.serialPort.close(error => {
                        if (error) {
                            throw error;
                        } else {
                            resolve();
                        }
                    });
                });
            }
            serialPorts.delete(path);
        }
    } else {
        fail(path, `Could not remove renderer (${sender.id}), port not found`);
        throw new Error(ErrorId.PORT_NOT_FOUND);
    }
};

export const update = (path: string, options: UpdateOptions) => {
    const openPort = serialPorts.get(path);
    if (!openPort) {
        fail(path, 'Could not update settings, port not found');
        throw new Error(ErrorId.PORT_NOT_FOUND);
    }

    const { serialPort } = openPort;
    return new Promise<void>((resolve, reject) => {
        serialPort.update(options, error => {
            if (error) {
                fail(path, `Could not update options: ${error.message}`);
                reject(error);
            } else {
                serialPorts.broadCast(
                    path,
                    SERIALPORT_CHANNEL.ON_UPDATE,
                    serialPort.settings
                );
                logInfo(path, `Updated settings: ${JSON.stringify(options)}`);
                resolve();
            }
        });
    });
};

export const set = (path: string, newOptions: SetOptions) => {
    const openPort = serialPorts.get(path);

    if (!openPort) {
        fail(path, 'Could not set new options, port not found');
        throw new Error(ErrorId.PORT_NOT_FOUND);
    }

    const { serialPort } = openPort;

    return new Promise<void>((resolve, reject) => {
        serialPort.set(newOptions, error => {
            if (error) {
                fail(
                    path,
                    `Could not set new options (${JSON.stringify(
                        newOptions
                    )}): ${error.message}`
                );
                reject(error);
            } else {
                serialPorts.broadCast(
                    path,
                    SERIALPORT_CHANNEL.ON_SET,
                    newOptions
                );
                logInfo(
                    path,
                    `Have set new options: ${JSON.stringify(newOptions)}`
                );
                resolve();
            }
        });
    });
};

const openNewSerialPort = async (
    options: SerialPortOpenOptions<AutoDetectTypes>,
    settingsLocked: boolean
) => {
    const { path } = options;
    const openPort = serialPorts.get(path);
    if (openPort && openPort.serialPort.isOpen) {
        logInfo(path, `Is already open, will be reopened.`);
        await new Promise<void>((resolve, reject) => {
            openPort.serialPort.close(error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    const newOpenPort: OpenPort = {
        ...openPort,
        serialPort: new SerialPort({ ...options, path, autoOpen: false }),
        renderers: openPort?.renderers ?? [],
        settingsLocked,
        opening: true,
        options,
    };
    serialPorts.set(path, newOpenPort);

    const { serialPort: port } = newOpenPort;

    port.on('data', data => {
        onData(path, data);
    });

    port.on('close', (error: Error) => {
        if (error) {
            fail(path, `Was closed due to error: ${error.message}`);
            serialPorts.broadCast(path, SERIALPORT_CHANNEL.ON_CLOSED);
            serialPorts.delete(path);
        } else {
            logInfo(path, 'Was closed');
        }
    });

    await new Promise<void>((resolve, reject) => {
        port.open(err => {
            if (err) {
                fail(path, `Could not open port: ${err.message}`);
                serialPorts.broadCast(path, SERIALPORT_CHANNEL.ON_CLOSED);
                serialPorts.delete(path);
                reject(Error(ErrorId.FAILED));
            } else {
                newOpenPort.opening = false;
                logInfo(path, 'Was opened');
                resolve();
            }
        });
    });
    return newOpenPort;
};

export const changeOptions = (
    options: SerialPortOpenOptions<AutoDetectTypes>,
    settingsLocked: boolean
) => {
    const openPort = serialPorts.get(options.path);
    if (!openPort) {
        fail(options.path, 'Could not change settings, port not found');
        return ErrorId.FAILED;
    }

    return openNewSerialPort(options, settingsLocked);
};

export const getBaudRate = (path: string): number | void =>
    serialPorts.get(path)?.serialPort.baudRate;

const addSender = (path: string, sender: Renderer, openPort: OpenPort) => {
    openPort.renderers.push(sender);

    // Remove renderer if renderer process is destroyed (window is closed).
    sender.on('destroyed', () => {
        logInfo(path, `Removed destroyed renderer (${sender.id})`);
        removeRenderer(path, sender);
    });

    // Remove renderer if renderer window is reloaded
    sender.on('did-finish-load', () => {
        logInfo(path, `Removed reloaded renderer (${sender.id})`);
        removeRenderer(path, sender);
    });
};
