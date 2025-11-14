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
import { continueUpdateProcess } from '../process/updateProcess';
import {
    getInstalledJLinkVersion,
    getJLinkUpdateProgress,
    isJLinkUpdateProgressDialogVisible,
    reset,
} from './jlinkUpdateSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isJLinkInstalled = !!useLauncherSelector(getInstalledJLinkVersion);
    const isVisible = useLauncherSelector(isJLinkUpdateProgressDialogVisible);
    const progress = useLauncherSelector(getJLinkUpdateProgress);
    const finished =
        progress?.step === 'install' && progress.percentage === 100;

    return (
        <GenericDialog
            isVisible={isVisible}
            title={`${
                isJLinkInstalled ? 'Updating' : 'Installing'
            } SEGGER J-Link`}
            showSpinner={!finished}
            footer={
                <DialogButton
                    onClick={() => {
                        dispatch(reset());
                        dispatch(continueUpdateProcess());
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
