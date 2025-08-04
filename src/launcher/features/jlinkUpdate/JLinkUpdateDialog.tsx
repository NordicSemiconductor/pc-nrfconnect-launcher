/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    ConfirmationDialog,
    describeError,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { inMain } from '../../../ipc/installJLink';
import { bundledJlinkVersion } from '../../../main/bundledJlink';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import continueInitialisingLauncher from '../initialisation/initialiseLauncherState';
import { checkForAppAndLauncherUpdateManually } from '../launcherUpdate/launcherUpdateEffects';
import {
    getInstalledJLinkVersion,
    getJLinkVersionToBeInstalled,
    isJLinkUpdateDialogVisible,
    ranJLinkCheckDuringStartup,
    reset,
    setError,
    showProgressDialog,
} from './jlinkUpdateSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isVisible = useLauncherSelector(isJLinkUpdateDialogVisible);
    const ranJlinkCheckDuringStartup = useLauncherSelector(
        ranJLinkCheckDuringStartup
    );
    const versionToBeInstalled = useLauncherSelector(
        getJLinkVersionToBeInstalled
    );
    const installedVersion = useLauncherSelector(getInstalledJLinkVersion);

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Compatible J-Link version available"
            confirmLabel="Yes"
            cancelLabel="No"
            onConfirm={() => {
                if (versionToBeInstalled) {
                    dispatch(showProgressDialog());
                    inMain
                        .startJLinkInstall(
                            versionToBeInstalled.toLowerCase() ===
                                bundledJlinkVersion.toLowerCase()
                        )
                        .catch(error =>
                            dispatch(setError(describeError(error)))
                        );
                }
            }}
            onCancel={() => {
                if (!ranJlinkCheckDuringStartup) {
                    dispatch(checkForAppAndLauncherUpdateManually());
                } else {
                    dispatch(continueInitialisingLauncher());
                }
                dispatch(reset());
            }}
        >
            Nordic Semiconductor recommends using version {versionToBeInstalled}{' '}
            of SEGGER J-Link.{' '}
            {installedVersion
                ? `You currently have version ${installedVersion} installed. Would you like to install the recommended version?`
                : 'Would you like to install it?'}
        </ConfirmationDialog>
    );
};
