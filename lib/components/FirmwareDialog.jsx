import React, { PropTypes } from 'react';

import ConfirmationDialog from './ConfirmationDialog';

const FirmwareDialog = ({
    isVisible,
    text,
    isInProgress,
    port,
    onConfirmUpdateFirmware,
    onCancel,
}) => {
    if (isVisible) {
        const textToUse = text || `The development kit on ${port.comName} (${port.serialNumber}) ` +
            'will be programmed with the required firmware. Would you like to proceed?';
        return (
            <ConfirmationDialog
                isVisible={isVisible}
                isInProgress={isInProgress}
                text={textToUse}
                onOk={() => onConfirmUpdateFirmware(port)}
                onCancel={onCancel}
            />
        );
    }
    return <div />;
};

FirmwareDialog.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    isInProgress: PropTypes.bool,
    port: PropTypes.shape({
        comName: PropTypes.string,
        serialNumber: PropTypes.string,
    }),
    text: PropTypes.string,
    onConfirmUpdateFirmware: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

FirmwareDialog.defaultProps = {
    isInProgress: false,
    port: null,
    text: null,
};

export default FirmwareDialog;
