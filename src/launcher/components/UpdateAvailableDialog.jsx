/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from 'pc-nrfconnect-shared';
import { bool, func, string } from 'prop-types';

/**
 * Dialog that is shown if an nRF Connect core update is available. The user
 * can either upgrade or cancel.
 *
 * @param {boolean} isVisible Show the dialog or not.
 * @param {string} version The new version number that is available.
 * @param {function} onClickReleaseNotes Invoked when the user clicks to see release notes.
 * @param {function} onConfirm Invoked when the user confirms the upgrade.
 * @param {function} onCancel Invoked when the user cancels the upgrade.
 * @returns {*} React element to be rendered.
 */
const UpdateAvailableDialog = ({
    isVisible,
    version,
    onClickReleaseNotes,
    onConfirm,
    onCancel,
}) => (
    <ConfirmationDialog
        isVisible={isVisible}
        title="Update available"
        text={
            `A new version (${version}) of nRF Connect is available. ` +
            'Would you like to upgrade now?'
        }
        okButtonText="Yes"
        cancelButtonText="No"
        onOk={onConfirm}
        onCancel={onCancel}
    >
        <p>
            A new version ({version}) of nRF Connect is available. Would you
            like to upgrade now?
        </p>
        <button
            className="btn btn-link core-btn-link"
            onClick={onClickReleaseNotes}
            type="button"
        >
            Click to see release notes
        </button>
    </ConfirmationDialog>
);

UpdateAvailableDialog.propTypes = {
    isVisible: bool.isRequired,
    version: string.isRequired,
    onClickReleaseNotes: func.isRequired,
    onConfirm: func.isRequired,
    onCancel: func.isRequired,
};

export default UpdateAvailableDialog;
