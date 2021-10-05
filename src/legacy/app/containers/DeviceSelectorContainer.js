/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from '../../decoration';
import * as DeviceActions from '../actions/deviceActions';
import DeviceSelector from '../components/DeviceSelector';

function mapStateToProps(state) {
    const { device } = state.core;

    return {
        devices: device.devices,
        selectedSerialNumber: device.selectedSerialNumber,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onMount: () => dispatch(DeviceActions.startWatchingDevices()),
        onUnmount: () => dispatch(DeviceActions.stopWatchingDevices()),
        onSelect: device =>
            dispatch(DeviceActions.selectAndSetupDevice(device)),
        onDeselect: () => dispatch(DeviceActions.deselectDevice()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    DeviceSelector,
    'DeviceSelector'
);
