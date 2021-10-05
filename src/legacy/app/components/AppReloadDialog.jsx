/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { bool, func, string } from 'prop-types';

import ConfirmationDialog from '../../components/ConfirmationDialog';

const AppReloadDialog = ({
    isVisible,
    onConfirmReload,
    onCancelReload,
    message,
}) => (
    <ConfirmationDialog
        isVisible={isVisible}
        onOk={onConfirmReload}
        onCancel={onCancelReload}
        okButtonText="Yes"
        cancelButtonText="No"
        text={message}
    />
);

AppReloadDialog.propTypes = {
    isVisible: bool.isRequired,
    onConfirmReload: func.isRequired,
    onCancelReload: func.isRequired,
    message: string.isRequired,
};

export default AppReloadDialog;
