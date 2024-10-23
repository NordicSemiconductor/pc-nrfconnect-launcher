/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    ConfirmationDialog,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { EventAction } from '../telemetry/telemetryEffects';
import {
    getConfirmLaunchDialog,
    hideConfirmLaunchDialog,
} from './appDialogsSlice';
import { launch } from './appsEffects';

export default () => {
    const dispatch = useLauncherDispatch();
    const confirmationDialog = useLauncherSelector(getConfirmLaunchDialog);

    return (
        <ConfirmationDialog
            isVisible={confirmationDialog.isVisible}
            title={confirmationDialog.isVisible ? confirmationDialog.title : ''}
            confirmLabel="Launch anyway"
            cancelLabel="Cancel"
            onConfirm={() => {
                if (!confirmationDialog.isVisible) {
                    throw new Error(
                        'Should be impossible to invoke a button on an invisible dialog'
                    );
                }

                dispatch(
                    launch(
                        confirmationDialog.app,
                        confirmationDialog.setQuickStartInfoWasShown
                    )
                );
                telemetry.sendEvent(EventAction.LAUNCH_APP_WARNING, {
                    warningIgnored: true,
                    ...confirmationDialog.warningData,
                });
                dispatch(hideConfirmLaunchDialog());
            }}
            onCancel={() => {
                if (confirmationDialog.isVisible) {
                    telemetry.sendEvent(EventAction.LAUNCH_APP_WARNING, {
                        warningIgnored: false,
                        ...confirmationDialog.warningData,
                    });
                    dispatch(hideConfirmLaunchDialog());
                }
            }}
        >
            {confirmationDialog.isVisible && confirmationDialog.text}
        </ConfirmationDialog>
    );
};
