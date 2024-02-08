/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    deviceInfo,
    DialogButton,
    GenericDialog,
    InstalledDownloadableApp,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { parsePackageJsonApp } from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import fs from 'fs';
import path from 'path';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { checkEngineAndLaunch } from '../apps/appsEffects';
import { getOfficialQuickStartApp } from '../apps/appsSlice';
import {
    getIsQuickStartInfoShownBefore,
    quickStartInfoWasShown,
} from '../settings/settingsSlice';
import { getIsTelemetryDialogVisible } from '../telemetry/telemetrySlice';

const DEFAULT_SUPPORTED_DEVICES = ['pca10090', 'pca10153'];

const nameFor = (pcaNumber: string) =>
    deviceInfo({
        id: 0,
        traits: {},
        devkit: { boardVersion: pcaNumber },
    }).name;

const packageJson = (quickStartApp?: InstalledDownloadableApp) => {
    if (quickStartApp?.installed.path == null) {
        return;
    }

    const packageJSONPath = path.join(
        quickStartApp?.installed.path,
        'package.json'
    );

    if (!fs.existsSync(packageJSONPath)) {
        return undefined;
    }

    const parsed = parsePackageJsonApp(
        fs.readFileSync(packageJSONPath, 'utf8')
    );
    return parsed.success ? parsed.data : undefined;
};

export default () => {
    const isQuickStartInfoShownBefore = useLauncherSelector(
        getIsQuickStartInfoShownBefore
    );
    const isTelemetryDialogVisible = useLauncherSelector(
        getIsTelemetryDialogVisible
    );
    const quickStartApp = useLauncherSelector(getOfficialQuickStartApp);

    const dispatch = useLauncherDispatch();

    const isVisible =
        !isQuickStartInfoShownBefore &&
        !isTelemetryDialogVisible &&
        quickStartApp != null;

    const supportedDevices =
        packageJson(quickStartApp)?.nrfConnectForDesktop?.supportedDevices ??
        DEFAULT_SUPPORTED_DEVICES;

    return (
        <GenericDialog
            isVisible={isVisible}
            closeOnEsc
            closeOnUnfocus
            title="Quick Start"
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        onClick={() => {
                            if (quickStartApp == null) {
                                throw new Error(
                                    'Dialog must not be visible if Quick Start app is not available.'
                                );
                            }

                            dispatch(quickStartInfoWasShown());
                            dispatch(checkEngineAndLaunch(quickStartApp));
                        }}
                    >
                        Open Quick Start app
                    </DialogButton>
                    <DialogButton
                        onClick={() => dispatch(quickStartInfoWasShown())}
                    >
                        Close
                    </DialogButton>
                </>
            }
        >
            <p>
                Do you have a new development kit? Use the Quick Start app to
                get up and running as fast as possible.
            </p>
            <p>Supported kits: {supportedDevices.map(nameFor).join(', ')}.</p>
        </GenericDialog>
    );
};
