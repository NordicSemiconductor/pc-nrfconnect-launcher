/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from '../../decoration';
import * as SerialPortActions from '../actions/serialPortActions';
import SerialPortSelector from '../components/SerialPortSelector';

function mapStateToProps(state) {
    const { serialPort } = state.core;

    return {
        ports: serialPort.ports,
        selectedPort: serialPort.selectedPort,
        isExpanded: serialPort.isSelectorExpanded,
        isLoading: serialPort.isLoading,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSelect: port => dispatch(SerialPortActions.selectPort(port)),
        onDeselect: () => dispatch(SerialPortActions.deselectPort()),
        onToggle: () => dispatch(SerialPortActions.toggleSelectorExpanded()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    SerialPortSelector,
    'SerialPortSelector'
);
