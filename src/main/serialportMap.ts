/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AutoDetectTypes } from '@serialport/bindings-cpp';
import { WebContents } from 'electron';
import { SerialPort, SerialPortOpenOptions } from 'serialport';

export type Renderer = Pick<WebContents, 'on' | 'send' | 'id'>;
export type OpenPort = {
    serialPort: SerialPort;
    renderers: Renderer[];
    settingsLocked: boolean;
    opening: boolean;
    options: SerialPortOpenOptions<AutoDetectTypes>;
};

const mapPath = (path: string) =>
    process.platform === 'win32' ? path.toLowerCase() : path;

class SerialPortMap {
    map = new Map<string, OpenPort>();

    set = (key: string, value: OpenPort) => {
        this.map.set(mapPath(key), value);
    };

    get = (key: string) => this.map.get(mapPath(key));

    has = (key: string) => this.map.has(mapPath(key));

    delete = (key: string) => this.map.delete(mapPath(key));

    clear = () => {
        this.map.clear();
    };
}

export const serialPorts = new SerialPortMap();
