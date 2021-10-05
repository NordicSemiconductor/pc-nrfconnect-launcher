/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from '../../decoration';
import * as FirmwareDialogActions from '../actions/firmwareDialogActions';
import * as SerialPortActions from '../actions/serialPortActions';
import FirmwareDialog from '../components/FirmwareDialog';

function mapStateToProps(state) {
    const { firmwareDialog } = state.core;

    return {
        port: firmwareDialog.port,
        isVisible: firmwareDialog.isVisible,
        isInProgress: firmwareDialog.isInProgress,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onConfirmUpdateFirmware: port =>
            dispatch(FirmwareDialogActions.firmwareUpdateRequested(port)),
        onCancel: () => {
            dispatch(SerialPortActions.deselectPort());
            dispatch(FirmwareDialogActions.hideDialog());
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    FirmwareDialog,
    'FirmwareDialog'
);
