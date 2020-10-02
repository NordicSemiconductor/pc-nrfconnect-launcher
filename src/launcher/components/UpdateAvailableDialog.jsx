/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ConfirmationDialog } from 'pc-nrfconnect-shared';

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
    isVisible: PropTypes.bool.isRequired,
    version: PropTypes.string.isRequired,
    onClickReleaseNotes: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default UpdateAvailableDialog;
