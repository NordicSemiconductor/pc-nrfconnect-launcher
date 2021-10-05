/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from '../../decoration';
import * as LogActions from '../actions/logActions';
import LogHeader from '../components/LogHeader';

const OPEN_LOGFILE_BUTTON_ID = 'openLogFileButton';
const CLEAR_LOG_BUTTON_ID = 'clearLogButton';
const TOGGLE_AUTO_SCROLL_BUTTON_ID = 'toggleAutoScrollButton';

function mapStateToProps(state) {
    const { log } = state.core;

    return {
        buttons: [
            {
                id: OPEN_LOGFILE_BUTTON_ID,
                title: 'Open log file',
                iconCssClass: 'mdi mdi-file-document-box-outline',
            },
            {
                id: CLEAR_LOG_BUTTON_ID,
                title: 'Clear log',
                iconCssClass: 'mdi mdi-trash-can-outline',
            },
            {
                id: TOGGLE_AUTO_SCROLL_BUTTON_ID,
                title: 'Scroll automatically',
                iconCssClass: 'mdi mdi-arrow-down',
                isSelected: log.autoScroll,
            },
        ],
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onButtonClicked: id => {
            switch (id) {
                case OPEN_LOGFILE_BUTTON_ID:
                    return LogActions.openLogFile();
                case CLEAR_LOG_BUTTON_ID:
                    return dispatch(LogActions.clear());
                case TOGGLE_AUTO_SCROLL_BUTTON_ID:
                    return dispatch(LogActions.toggleAutoScroll());
                default:
                    return {};
            }
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    LogHeader,
    'LogHeader'
);
