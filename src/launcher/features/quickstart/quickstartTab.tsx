/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Button } from 'pc-nrfconnect-shared';

import { isInstalled, isUpdatable, isWithdrawn } from '../../../ipc/apps';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { installDownloadableApp, launch } from '../apps/appsEffects';
import { getAllApps, isInProgress } from '../apps/appsSlice';
import { quickstartAppName, quickstartAppSource } from './quickstartApp';

export default () => {
    const dispatch = useLauncherDispatch();
    const quickstartApp = useLauncherSelector(getAllApps).find(
        app =>
            app.name === quickstartAppName && app.source === quickstartAppSource
    );

    return (
        <div className="tw-flex tw-h-full tw-w-full tw-flex-col tw-items-center tw-justify-center tw-gap-5 tw-bg-white">
            <div className="tw-max-w-xs tw-text-sm">
                Get started quickly by installing all recommended dependencies,
                SDK, toolchain and more. Just launch Quickstart and follow the
                instructions.
            </div>
            {isInstalled(quickstartApp) && !isUpdatable(quickstartApp) && (
                <Button
                    variant="link-button"
                    large
                    disabled={isInProgress(quickstartApp)}
                    onClick={() => {
                        launch(quickstartApp);
                    }}
                    className="tw-px-14"
                >
                    Launch quickstart
                </Button>
            )}
            {(isUpdatable(quickstartApp) ||
                (quickstartApp && !isInstalled(quickstartApp)) ||
                isWithdrawn(quickstartApp)) && (
                <Button
                    variant="link-button"
                    large
                    disabled={isInProgress(quickstartApp)}
                    onClick={() =>
                        dispatch(installDownloadableApp(quickstartApp))
                    }
                    className="tw-px-14"
                >
                    Update and launch quickstart
                </Button>
            )}
        </div>
    );
};
