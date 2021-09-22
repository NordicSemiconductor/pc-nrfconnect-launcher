/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import * as AppsActions from '../actions/appsActions';
import ConfirmLaunchDialog from '../components/ConfirmLaunchDialog';

function mapStateToProps(state) {
    const { apps } = state;

    return {
        isVisible: apps.isConfirmLaunchDialogVisible,
        text: apps.confirmLaunchText,
        app: apps.confirmLaunchApp,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onConfirm: app => {
            dispatch(AppsActions.hideConfirmLaunchDialogAction());
            AppsActions.launch(app);
        },
        onCancel: () => dispatch(AppsActions.hideConfirmLaunchDialogAction()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfirmLaunchDialog);
