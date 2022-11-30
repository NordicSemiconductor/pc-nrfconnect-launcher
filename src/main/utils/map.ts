/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

class CaseInsensitiveMap<T, U> extends Map<T, U> {
    set(key: T, value: U): this {
        if (typeof key === 'string') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            key = key.toLowerCase() as any as T;
        }
        return super.set(key, value);
    }

    get(key: T): U | undefined {
        if (typeof key === 'string') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            key = key.toLowerCase() as any as T;
        }
        return super.get(key);
    }

    has(key: T): boolean {
        if (typeof key === 'string') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            key = key.toLowerCase() as any as T;
        }
        return super.has(key);
    }

    delete(key: T): boolean {
        if (typeof key === 'string') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            key = key.toLowerCase() as any as T;
        }
        return super.delete(key);
    }
}

type PlatformSpecificMap<T, U> = CaseInsensitiveMap<T, U> | Map<T, U>;

export const initPlatformSpecificMap = <T, U>(): PlatformSpecificMap<T, U> => {
    if (process.platform === 'win32') {
        return new CaseInsensitiveMap<T, U>();
    }
    return new Map<T, U>();
};
