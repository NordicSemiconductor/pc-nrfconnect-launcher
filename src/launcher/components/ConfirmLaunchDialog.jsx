/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from 'pc-nrfconnect-shared';
import { bool, func, shape, string } from 'prop-types';

const ConfirmLaunchDialog = ({ isVisible, text, app, onConfirm, onCancel }) => (
    <ConfirmationDialog
        isVisible={isVisible}
        title="Version problem"
        text={text}
        okButtonText="Launch anyway"
        cancelButtonText="Cancel"
        onOk={() => onConfirm(app)}
        onCancel={onCancel}
    />
);

ConfirmLaunchDialog.propTypes = {
    isVisible: bool.isRequired,
    text: string.isRequired,
    app: shape({
        name: string.isRequired,
    }),
    onConfirm: func.isRequired,
    onCancel: func.isRequired,
};

ConfirmLaunchDialog.defaultProps = {
    app: null,
};

export default ConfirmLaunchDialog;
