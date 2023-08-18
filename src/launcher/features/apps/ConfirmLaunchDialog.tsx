/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
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
            title="Version problem"
            confirmLabel="Launch anyway"
            cancelLabel="Cancel"
            onConfirm={() => {
                if (!confirmationDialog.isVisible) {
                    throw new Error(
                        'Should be impossible to invoke a disabled button'
                    );
                }

                launch(confirmationDialog.app);
            }}
            onCancel={() => dispatch(hideConfirmLaunchDialog())}
        >
            {confirmationDialog.isVisible && confirmationDialog.text}
        </ConfirmationDialog>
    );
};
