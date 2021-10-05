/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import * as UsageDataActions from '../actions/usageDataActions';
import UsageDataDialog from '../components/UsageDataDialog';

function mapStateToProps(state) {
    return {
        isVisible: state.settings.isUsageDataDialogVisible,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onConfirm: () => {
            dispatch(UsageDataActions.confirmSendingUsageData());
        },
        onCancel: () => {
            dispatch(UsageDataActions.cancelSendingUsageData());
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsageDataDialog);
