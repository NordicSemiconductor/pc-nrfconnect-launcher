/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';

import { SourceName } from '../../ipc/sources';

declare function LoadDownloadableApps(
    appName: string,
    appSource: SourceName
): ThunkAction<void, unknown, unknown, AnyAction>;
declare function LoadDownloadableApps(): ThunkAction<
    void,
    unknown,
    unknown,
    AnyAction
>;

export const loadDownloadableApps: {
    (appName: string, appSource: SourceName): ThunkAction<
        void,
        unknown,
        unknown,
        AnyAction
    >;
    (): ThunkAction<void, unknown, unknown, AnyAction>;
};

export const setAppManagementSource: (
    source?: SourceName,
    show?: boolean
) => ThunkAction<void, unknown, unknown, AnyAction>;
