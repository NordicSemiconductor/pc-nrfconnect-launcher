/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ConfirmationDialog } from 'pc-nrfconnect-shared';
import { bool, func, string } from 'prop-types';

const ConfirmRemoveSourceDialog = ({
    isVisible,
    source,
    onConfirm,
    onCancel,
}) => (
    <ConfirmationDialog
        isVisible={isVisible}
        title="Remove app source"
        text={`Are you sure to remove "${source}" source along with any apps installed from it?`}
        okButtonText="Yes, remove"
        cancelButtonText="Cancel"
        onOk={() => onConfirm(source)}
        onCancel={onCancel}
    />
);

ConfirmRemoveSourceDialog.propTypes = {
    isVisible: bool.isRequired,
    source: string,
    onConfirm: func.isRequired,
    onCancel: func.isRequired,
};

ConfirmRemoveSourceDialog.defaultProps = {
    source: null,
};

export default ConfirmRemoveSourceDialog;
