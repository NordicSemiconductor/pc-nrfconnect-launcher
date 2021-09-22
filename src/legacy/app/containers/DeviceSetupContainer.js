/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from '../../decoration';
import * as DeviceActions from '../actions/deviceActions';
import DeviceSetupDialog from '../components/DeviceSetupDialog';

function mapStateToProps(state) {
    const { device } = state.core;

    return {
        isVisible: device.isSetupDialogVisible,
        isInProgress:
            device.isSetupDialogVisible && !device.isSetupWaitingForUserInput,
        text: device.setupDialogText,
        choices: device.setupDialogChoices,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onOk: input => dispatch(DeviceActions.deviceSetupInputReceived(input)),
        onCancel: () => dispatch(DeviceActions.deviceSetupInputReceived(false)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    DeviceSetupDialog,
    'DeviceSetupDialog'
);
