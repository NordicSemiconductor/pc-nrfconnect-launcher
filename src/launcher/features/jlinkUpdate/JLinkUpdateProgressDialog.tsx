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
import continueInitialisingLauncher from '../initialisation/initialiseLauncherState';
import { checkForAppAndLauncherUpdateManually } from '../launcherUpdate/launcherUpdateEffects';
import {
    getJLinkUpdateProgress,
    isJLinkUpdateProgressDialogVisible,
    ranJLinkCheckDuringStartup,
    reset,
} from './jlinkUpdateSlice';

export default () => {
    const dispatch = useLauncherDispatch();
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
            title="Updating SEGGER J-Link"
            showSpinner={!finished}
            onHide={() => dispatch(continueInitialisingLauncher())}
            footer={
                <DialogButton
                    onClick={() => {
                        if (!ranJlinkCheckDuringStartup) {
                            dispatch(checkForAppAndLauncherUpdateManually());
                        } else {
                            dispatch(continueInitialisingLauncher());
                        }
                        dispatch(reset());
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
                'Installing J-Link...'}
            {progress?.step === 'install' &&
                !finished &&
                process.platform !== 'linux' &&
                'J-Link is being installed in a separate window...'}
            {finished && 'J-Link installation completed.'}
        </GenericDialog>
    );
};
