/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    describeError,
    DialogButton,
    ErrorDialogActions,
    GenericDialog,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { inMain } from '../../../ipc/jlink';
import bundledJlinkVersion from '../../../main/bundledJlink';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { continueUpdateProcess } from '../process/updateProcess';
import {
    getInstalledJLinkVersion,
    getJLinkVersionToBeInstalled,
    isJLinkUpdateDialogVisible,
    reset,
    showProgressDialog,
} from './jlinkUpdateSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isVisible = useLauncherSelector(isJLinkUpdateDialogVisible);
    const versionToBeInstalled = useLauncherSelector(
        getJLinkVersionToBeInstalled,
    );
    const installedVersion = useLauncherSelector(getInstalledJLinkVersion);

    return (
        <GenericDialog
            isVisible={isVisible}
            title={
                installedVersion
                    ? 'Compatible SEGGER J-Link version available'
                    : 'Install SEGGER J-Link'
            }
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        onClick={() => {
                            if (versionToBeInstalled) {
                                dispatch(showProgressDialog());
                                inMain
                                    .installJLink(
                                        versionToBeInstalled.toLowerCase() ===
                                            bundledJlinkVersion.toLowerCase(),
                                    )
                                    .catch(error => {
                                        dispatch(
                                            ErrorDialogActions.showDialog(
                                                `Unable to update SEGGER J-Link: ${describeError(
                                                    error,
                                                )}`,
                                            ),
                                        );
                                        dispatch(reset());
                                    });
                            }
                        }}
                    >
                        Install
                    </DialogButton>
                    {installedVersion && (
                        <DialogButton
                            variant="secondary"
                            onClick={() => {
                                dispatch(reset());
                                dispatch(continueUpdateProcess());
                            }}
                        >
                            Close
                        </DialogButton>
                    )}
                </>
            }
        >
            {installedVersion
                ? `Nordic Semiconductor recommends using version ${versionToBeInstalled} of SEGGER J-Link. You currently have version ${installedVersion} installed. Would you like to install the recommended version now?`
                : `nRF Connect for Desktop requires SEGGER J-Link. The recommended version ${versionToBeInstalled} is available for installation. Click "Install" to start.`}
        </GenericDialog>
    );
};
