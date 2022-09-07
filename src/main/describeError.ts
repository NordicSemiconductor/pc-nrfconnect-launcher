/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/*
 * This is a copy of pc-nrfconnect-shared/src/logging/describeError.ts because
 * for now it was easier to just copy it over instead of either also starting
 * to build shared or teaching esbuilt to include shared when building main
 */

interface MaybeWithMessageAndOrigin {
    message?: string;
    origin?: MaybeWithMessageAndOrigin;
}

function hasMaybeMessageAndOrigin(
    error: unknown
): error is MaybeWithMessageAndOrigin {
    return error != null;
}

const describe = (error: MaybeWithMessageAndOrigin) => {
    if (error instanceof Error) {
        return String(error);
    }

    if (error.message != null) {
        return error.message;
    }

    return JSON.stringify(error);
};

const describeOrigin = (origin?: MaybeWithMessageAndOrigin) => {
    if (origin == null) {
        return '';
    }

    return ` (Origin: ${describe(origin)})`;
};

export default (error: unknown) => {
    if (error == null) {
        return String(error);
    }

    /* Because we asserted that error is neither null nor undefined above, we
       can access properties like `message` and `origin` from here on, without
       fearing a "Cannot read property 'message' of null/undefined". But
       TypeScript is not convinced of this. So here comes a statement with a
       Error that should really never be thrown, just to convince TypeScript
       of the fact that we can afterwards read the properties `message` and
       `origin`.
    */
    if (!hasMaybeMessageAndOrigin(error)) {
        throw Error('Will never be thrown');
    }

    return describe(error) + describeOrigin(error.origin);
};
