/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    Dialog,
    DialogButton,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { isAppUpdateAvailable as isAppUpdateAvailableSelector } from '../apps/appsSlice';
import {
    getIsUpdateCheckCompleteVisible,
    hideUpdateCheckComplete,
} from './settingsSlice';

export default () => {
    const dispatch = useLauncherDispatch();

    const isVisible = useLauncherSelector(getIsUpdateCheckCompleteVisible);

    const isAppUpdateAvailable = useLauncherSelector(
        isAppUpdateAvailableSelector,
    );

    const hideDialog = () => dispatch(hideUpdateCheckComplete());

    return (
        <Dialog isVisible={isVisible}>
            <Dialog.Header title="Update check completed" />
            <Dialog.Body>
                {isAppUpdateAvailable ? (
                    <>
                        One or more updates are available. Go to the apps screen
                        to update.
                    </>
                ) : (
                    <>All apps are up to date.</>
                )}
            </Dialog.Body>
            <Dialog.Footer>
                <DialogButton onClick={hideDialog}>Got it</DialogButton>
            </Dialog.Footer>
        </Dialog>
    );
};
