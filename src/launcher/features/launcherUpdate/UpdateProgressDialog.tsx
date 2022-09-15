/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Spinner } from 'pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { cancelDownload } from './launcherUpdateEffects';

export default () => {
    const dispatch = useLauncherDispatch();
    const {
        isUpdateProgressDialogVisible: isVisible,
        isProgressSupported,
        isCancelSupported,
        latestVersion: version,
        percentDownloaded,
        isCancelling,
    } = useLauncherSelector(state => state.autoUpdate);

    return (
        <Modal show={isVisible} backdrop>
            <Modal.Header closeButton={false}>
                <Modal.Title>Downloading update</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
            </Modal.Body>
            <Modal.Footer>
                {!isProgressSupported && <Spinner />}
                {isCancelSupported && (
                    <Button
                        onClick={() => dispatch(cancelDownload())}
                        disabled={isCancelling || percentDownloaded === 100}
                    >
                        Cancel
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};
