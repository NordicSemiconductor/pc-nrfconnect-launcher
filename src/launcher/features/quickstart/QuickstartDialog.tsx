/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    DialogButton,
    GenericDialog,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { checkEngineAndLaunch } from '../apps/appsEffects';
import { getOfficialQuickstartApp } from '../apps/appsSlice';
import {
    getIsQuickstartInfoShownBefore,
    quickstartInfoWasShown,
} from '../settings/settingsSlice';
import { getIsUsageDataDialogVisible } from '../usageData/usageDataSlice';

export default () => {
    const isQuickstartInfoShownBefore = useLauncherSelector(
        getIsQuickstartInfoShownBefore
    );
    const isUsageDataDialogVisible = useLauncherSelector(
        getIsUsageDataDialogVisible
    );
    const quickstartApp = useLauncherSelector(getOfficialQuickstartApp);

    const dispatch = useLauncherDispatch();

    const isVisible =
        !isQuickstartInfoShownBefore &&
        !isUsageDataDialogVisible &&
        quickstartApp != null;

    return (
        <GenericDialog
            isVisible={isVisible}
            closeOnEsc
            closeOnUnfocus
            title="Quickstart"
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        onClick={() => {
                            if (quickstartApp == null) {
                                throw new Error(
                                    'Dialog must not be visible if quickstart app is not available.'
                                );
                            }

                            dispatch(quickstartInfoWasShown());
                            dispatch(checkEngineAndLaunch(quickstartApp));
                        }}
                    >
                        Open Quickstart app
                    </DialogButton>
                    <DialogButton
                        onClick={() => dispatch(quickstartInfoWasShown())}
                    >
                        Close
                    </DialogButton>
                </>
            }
        >
            <p>
                Do you have a new development kit? Use the Quickstart app to get
                up and running as fast as possible.
            </p>
            <p>Supported kits: nRF9160 DK, nRF9161 DK.</p>
        </GenericDialog>
    );
};
