/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getIsAppleSiliconDialogVisible } from '../appleSilicon/appleSiliconSlice';
import { checkCompatibilityThenLaunch } from '../apps/appsEffects';
import { getOfficialQuickStartApp } from '../apps/appsSlice';
import {
    getIsQuickStartInfoShownBefore,
    quickStartInfoWasShown,
} from '../settings/settingsSlice';
import { getIsTelemetryDialogVisible } from '../telemetry/telemetrySlice';

export default () => {
    const isQuickStartInfoShownBefore = useLauncherSelector(
        getIsQuickStartInfoShownBefore,
    );
    const isTelemetryDialogVisible = useLauncherSelector(
        getIsTelemetryDialogVisible,
    );

    const isAppleSiliconDialogVisible = useLauncherSelector(
        getIsAppleSiliconDialogVisible,
    );

    const quickStartApp = useLauncherSelector(getOfficialQuickStartApp);

    const dispatch = useLauncherDispatch();

    const isVisible =
        !isQuickStartInfoShownBefore &&
        !isTelemetryDialogVisible &&
        !isAppleSiliconDialogVisible &&
        quickStartApp != null;

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Quick Start"
            confirmLabel="Open Quick Start app"
            onConfirm={() => {
                if (quickStartApp == null) {
                    throw new Error(
                        'Dialog must not be visible if Quick Start app is not available.',
                    );
                }

                dispatch(checkCompatibilityThenLaunch(quickStartApp, true));
            }}
            cancelLabel="Close"
            onCancel={() => dispatch(quickStartInfoWasShown())}
        >
            <p>
                Do you have a new development kit? Use the Quick Start app to
                get up and running as fast as possible.
            </p>
        </ConfirmationDialog>
    );
};
