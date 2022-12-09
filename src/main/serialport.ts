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

export const openOrAdd = async (
    sender: Renderer,
    options: SerialPortOpenOptions<AutoDetectTypes>,
    { overwrite = false, settingsLocked = false }: OverwriteOptions
) => {
    const { path } = options;
    const existingPort = serialPorts.get(path);
    if (existingPort) {
        if (existingPort.opening) {
            logger.warn(
                `SerialPort: Port with path=${path} rejected renderer with id=${sender.id}, because the port is being opened by a different renderer.`
            );
            throw new Error('PORT_IS_ALREADY_BEING_OPENED');
        }

        const alreadyInList = existingPort.renderers.some(
            renderer => renderer.id === sender.id
        );

        if (!alreadyInList) {
            let isDifferentSettings;
            if (existingPort.serialPort) {
                const currentOptions = existingPort.options;

                if (
                    Object.keys(currentOptions).length ===
                    Object.keys(options).length
                ) {
                    Object.entries(options).every(([key, value]) => {
                        if (
                            !(key in currentOptions) ||
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (currentOptions as any)[key] !== value
                        ) {
                            isDifferentSettings = true;
                            return false;
                        }
                        return true;
                    });
                } else {
                    isDifferentSettings = true;
                }
            }

            if (isDifferentSettings) {
                if (existingPort.settingsLocked) {
                    logger.warn(
                        `SerialPort: Port with path=${path} rejected renderer with id=${sender.id}, because the port is already open with different settings than what the renderer requested, and the settings are locked.`
                    );
                    throw new Error('FAILED_SETTINGS_LOCKED');
                }
                if (!overwrite) {
                    logger.warn(
                        `SerialPort: Port with path=${path} rejected renderer with id=${sender.id}, because the port is already open with different settings than what the renderer requested, and the renderer did not request to overwrite settings.`
                    );
                    throw new Error('FAILED_DIFFERENT_SETTINGS');
                }

                const result = await changeOptions(options, settingsLocked);
                if (result === 'FAILED') {
                    logger.error(
                        `SerialPort: Renderer with id=${sender.id} requested to overwrite settings of port=${path}, but failed.`
                    );
                    throw new Error('FAILED');
                }
                serialPorts.broadCast(
                    path,
                    SERIALPORT_CHANNEL.ON_CHANGED,
                    options
                );
            }
            existingPort.renderers.push(sender);
            addSenderEvents(path, sender);
            logger.info(
                `SerialPort: Port with path=${path} added renderer with id=${sender.id} to its list of renderers.`
            );
        }
        return;
    }

    await openNewSerialPort(options, settingsLocked)
        .then(() => {
            const openPort = serialPorts.get(path);
            openPort?.renderers.push(sender);
            addSenderEvents(path, sender);
        })
        .catch(() => {
            throw new Error('FAILED');
        });
};

export const writeToSerialport = (path: string, data: string) => {
    const openPort = serialPorts.get(path);
    if (!openPort) {
        logger.error(
            `SerialPort: Port with path=${path} could not set new options, because port was not found.`
        );
        throw new Error('PORT_NOT_FOUND');
    }

    if (!openPort.serialPort.isOpen) {
        logger.error(
            `SerialPort: Port with path=${path} could not set new options, because port is not open.`
        );
        throw new Error('PORT_NOT_OPEN');
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
        logger.error(
            `SerialPort: Port with path=${path} was not found, and could not report if it's open.`
        );
        throw new Error('PORT_NOT_FOUND');
    }
    logger.info(
        `SerialPort: Port with path=${path} was asked if it's open, and returned ${port.isOpen}`
    );
    return port.isOpen;
};

/* Return true if port is closed, false otherwise */
export const closeSerialPort = async (
    sender: Renderer,
    path: string
): Promise<void> => {
    const openPort = serialPorts.get(path);
    if (!openPort) {
        logger.error(
            `SerialPort: Port with path=${path} could not set new options, because port was not found.`
        );
        throw new Error('PORT_NOT_FOUND');
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
        logger.info(
            `SerialPort: Port with path=${path} have removed renderer with id=${sender.id} from its renderers list.`
        );

        if (openPort.renderers.length === 0) {
            if (openPort.serialPort.isOpen) {
                logger.info(
                    `SerialPort: Port with path=${path} have an empty renderers list and will be closed.`
                );
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
        logger.error(
            `SerialPort: Port with path=${path}: tried to remove renderer with id=${sender.id}, but could not find port.`
        );
        throw new Error('PORT_NOT_FOUND');
    }
};

export const update = (path: string, options: UpdateOptions) => {
    const openPort = serialPorts.get(path);
    if (!openPort) {
        logger.error(
            `SerialPort: Port with path=${path} could not update options, because port was not found.`
        );
        return;
    }

    const { serialPort } = openPort;
    return new Promise<void>((resolve, reject) => {
        serialPort.update(options, error => {
            if (error) {
                logger.error(
                    `SerialPort: Port with path=${path} could not update options: ${error.message}`
                );
                reject(error);
            } else {
                serialPorts.broadCast(
                    path,
                    SERIALPORT_CHANNEL.ON_UPDATE,
                    serialPort.settings
                );
                logger.info(
                    `SerialPort: Port with path=${path} updated settings: ${JSON.stringify(
                        options
                    )}`
                );
                resolve();
            }
        });
    });
};

export const set = (path: string, newOptions: SetOptions) => {
    const openPort = serialPorts.get(path);

    if (!openPort) {
        logger.error(
            `SerialPort: Port with path=${path} could not set new options, because port was not found.`
        );
        return;
    }

    const { serialPort } = openPort;

    serialPort.set(newOptions, error => {
        if (error) {
            logger.error(
                `SerialPort: Port with path=${path} was not able to set new options: ${JSON.stringify(
                    newOptions
                )}`
            );
        } else {
            serialPorts.broadCast(path, SERIALPORT_CHANNEL.ON_SET, newOptions);
            logger.info(
                `SerialPort: Port with path=${path} was set with new settings: ${JSON.stringify(
                    newOptions
                )}`
            );
        }
    });
};

const openNewSerialPort = async (
    options: SerialPortOpenOptions<AutoDetectTypes>,
    settingsLocked: boolean
) => {
    const { path } = options;
    const openPort = serialPorts.get(path);
    if (openPort && openPort.serialPort.isOpen) {
        logger.info(
            `SerialPort: Port with path=${path} is already open, but will be reopened.`
        );
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
            logger.error(
                `SerialPort: Port with path=${path} was closed due to an error: ${error.message}`
            );
            serialPorts.broadCast(path, SERIALPORT_CHANNEL.ON_CLOSED);
            serialPorts.delete(path);
        } else {
            logger.info(
                `SerialPort: Port with path=${path} was closed quietly.`
            );
        }
    });

    return new Promise<void>((resolve, reject) => {
        port.open(err => {
            if (err) {
                logger.error(
                    `SerialPort: Port with path=${path} could not be opened: ${err.message}`
                );
                serialPorts.broadCast(path, SERIALPORT_CHANNEL.ON_CLOSED);
                serialPorts.delete(path);
                reject(Error('FAILED'));
            } else {
                newOpenPort.opening = false;
                logger.info(
                    `SerialPort: Port with path=${path} has been opened.`
                );
                resolve();
            }
        });
    });
};

export const changeOptions = async (
    options: SerialPortOpenOptions<AutoDetectTypes>,
    settingsLocked: boolean
) => {
    const openPort = serialPorts.get(options.path);
    if (!openPort) {
        logger.error(
            `SerialPort: Port with path=${options.path} was asked to change settings, but could not be found.`
        );
        return 'FAILED';
    }

    const result = await openNewSerialPort(options, settingsLocked);
    return result;
};

export const getSettings = (path: string): number | void => {
    const openPort = serialPorts.get(path);
    if (!openPort) {
        logger.error(
            `SerialPort: Port with path=${path} was not found, and could not report settings.`
        );
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
