/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import {
    DialogButton,
    GenericDialog,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { updateJLinkCompatibilityForAllApps } from '../apps/appsEffects';
import continueLauncherInitialisation from '../initialisation/initialiseLauncher';
import { checkForAppAndLauncherUpdateManually } from '../launcherUpdate/launcherUpdateEffects';
import {
    getInstalledJLinkVersion,
    getJLinkUpdateProgress,
    isJLinkUpdateProgressDialogVisible,
    ranJLinkCheckDuringStartup,
    reset,
} from './jlinkUpdateSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isJLinkInstalled = !!useLauncherSelector(getInstalledJLinkVersion);
    const isVisible = useLauncherSelector(isJLinkUpdateProgressDialogVisible);
    const progress = useLauncherSelector(getJLinkUpdateProgress);
    const ranJlinkCheckDuringStartup = useLauncherSelector(
        ranJLinkCheckDuringStartup
    );
    const finished =
        progress && progress.step === 'install' && progress.percentage === 100;

    return (
        <GenericDialog
            isVisible={isVisible}
            title={`${
                isJLinkInstalled ? 'Updating' : 'Installing'
            } SEGGER J-Link`}
            showSpinner={!finished}
            onHide={() => dispatch(continueLauncherInitialisation())}
            footer={
                <DialogButton
                    onClick={() => {
                        if (!ranJlinkCheckDuringStartup) {
                            dispatch(checkForAppAndLauncherUpdateManually());
                        } else {
                            dispatch(continueLauncherInitialisation());
                        }
                        dispatch(reset());
                        dispatch(updateJLinkCompatibilityForAllApps());
                    }}
                    disabled={!finished}
                >
                    Close
                </DialogButton>
            }
        >
            {!progress && 'Preparing installation...'}
            {progress?.step === 'download' && (
                <>
                    Downloading...
                    <ProgressBar
                        label={`${progress?.percentage || 0}%`}
                        now={progress?.percentage || 0}
                    />
                </>
            )}
            {progress?.step === 'install' &&
                !finished &&
                process.platform === 'linux' &&
                'Installing SEGGER J-Link...'}
            {progress?.step === 'install' &&
                !finished &&
                process.platform !== 'linux' &&
                'SEGGER J-Link is being installed in a separate window...'}
            {finished && 'SEGGER J-Link installation completed.'}
        </GenericDialog>
    );
};
