/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Dialog, DialogButton, Spinner } from 'pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { cancelDownload } from './launcherUpdateEffects';
import { getLauncherUpdate } from './launcherUpdateSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const {
        isUpdateProgressDialogVisible: isVisible,
        isProgressSupported,
        isCancelSupported,
        latestVersion: version,
        percentDownloaded,
        isCancelling,
    } = useLauncherSelector(getLauncherUpdate);

    return (
        <Dialog isVisible={isVisible} closeOnUnfocus={false}>
            <Dialog.Header title="Downloading update" />
            <Dialog.Body>
                <p>Downloading nRF Connect for Desktop {version}...</p>
                {isProgressSupported && (
                    <ProgressBar
                        label={`${percentDownloaded}%`}
                        now={percentDownloaded}
                    />
                )}
                <p>
                    This might take a few minutes. The application will restart
                    and update once the download is complete.
                </p>
            </Dialog.Body>
            <Dialog.Footer>
                {!isProgressSupported && <Spinner />}
                {isCancelSupported && (
                    <DialogButton
                        onClick={() => dispatch(cancelDownload())}
                        disabled={isCancelling || percentDownloaded === 100}
                        variant="primary"
                    >
                        Cancel
                    </DialogButton>
                )}
            </Dialog.Footer>
        </Dialog>
    );
};
