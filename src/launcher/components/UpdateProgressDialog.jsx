/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Spinner } from 'pc-nrfconnect-shared';
import { bool, func, number, string } from 'prop-types';

const UpdateProgressDialog = ({
    isVisible,
    isProgressSupported,
    isCancelSupported,
    version,
    percentDownloaded,
    onCancel,
    isCancelling,
}) => (
    <Modal show={isVisible} backdrop>
        <Modal.Header closeButton={false}>
            <Modal.Title>Downloading update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>Downloading nRF Connect {version}...</p>
            {isProgressSupported && (
                <ProgressBar
                    label={`${percentDownloaded}%`}
                    now={percentDownloaded}
                />
            )}
            <p>
                This might take a few minutes. The application will restart and
                update once the download is complete.
            </p>
        </Modal.Body>
        <Modal.Footer>
            {!isProgressSupported && <Spinner />}
            {isCancelSupported && (
                <Button
                    onClick={onCancel}
                    disabled={isCancelling || percentDownloaded === 100}
                >
                    Cancel
                </Button>
            )}
        </Modal.Footer>
    </Modal>
);

UpdateProgressDialog.propTypes = {
    isVisible: bool.isRequired,
    isProgressSupported: bool.isRequired,
    isCancelSupported: bool.isRequired,
    version: string.isRequired,
    percentDownloaded: number.isRequired,
    onCancel: func.isRequired,
    isCancelling: bool.isRequired,
};

export default UpdateProgressDialog;
