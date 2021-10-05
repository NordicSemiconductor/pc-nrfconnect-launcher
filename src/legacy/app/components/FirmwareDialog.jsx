/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { bool, func, number, shape, string } from 'prop-types';

import ConfirmationDialog from '../../components/ConfirmationDialog';
import portPath from '../../portPath';

const FirmwareDialog = ({
    isVisible,
    text,
    isInProgress,
    port,
    onConfirmUpdateFirmware,
    onCancel,
}) => {
    if (isVisible) {
        const textToUse =
            text ||
            'Would you like to program the development kit' +
                ` on ${portPath(port)} (${port.serialNumber})` +
                ' with the required firmware?';
        return (
            <ConfirmationDialog
                isVisible={isVisible}
                isInProgress={isInProgress}
                text={textToUse}
                okButtonText="Yes"
                cancelButtonText="No"
                onOk={() => onConfirmUpdateFirmware(port)}
                onCancel={() => onCancel(port)}
            />
        );
    }
    return <div />;
};

FirmwareDialog.propTypes = {
    isVisible: bool.isRequired,
    isInProgress: bool,
    port: shape({
        comName: string,
        path: string,
        serialNumber: number,
    }),
    text: string,
    onConfirmUpdateFirmware: func.isRequired,
    onCancel: func.isRequired,
};

FirmwareDialog.defaultProps = {
    isInProgress: false,
    port: null,
    text: null,
};

export default FirmwareDialog;
