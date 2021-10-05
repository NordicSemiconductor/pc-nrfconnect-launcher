/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from '../../decoration';
import * as LogActions from '../actions/logActions';
import LogViewer from '../components/LogViewer';

function mapStateToProps(state) {
    const { log } = state.core;

    return {
        logEntries: log.logEntries,
        autoScroll: log.autoScroll,
        containerHeight: log.containerHeight,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onMount: () => dispatch(LogActions.startReading()),
        onUnmount: () => dispatch(LogActions.stopReading()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    LogViewer,
    'LogViewer'
);
