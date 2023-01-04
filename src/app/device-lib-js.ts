/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as deviceLib from '@nordicsemiconductor/nrf-device-lib-js';

const hotplug = new Proxy(deviceLib.startHotplugEvents, {
    apply(target, thisArg, argArray) {
        // @ts-expect-error Typing of argArray too weak
        const id = target(...argArray);
        window.addEventListener('beforeunload', () => {
            deviceLib.stopHotplugEvents(id);
        });

        return id;
    },
});

const logEvents = new Proxy(deviceLib.startLogEvents, {
    apply(target, thisArg, argArray) {
        // @ts-expect-error Typing of argArray too weak
        const id = target(...argArray);
        window.addEventListener('beforeunload', () => {
            deviceLib.stopLogEvents(id);
        });

        return id;
    },
});

const proxy = new Proxy(deviceLib, {
    get(target, p) {
        if (p === 'startHotplugEvents') {
            return hotplug;
        }

        if (p === 'startLogEvents') {
            return logEvents;
        }

        // @ts-expect-error Nothing to see here
        return target[p];
    },
});

export default proxy;
