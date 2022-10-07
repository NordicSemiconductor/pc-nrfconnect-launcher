/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import ConfirmLaunchDialog from '../components/ConfirmLaunchDialog';
import { launch } from '../features/apps/appsEffects';
import { hideConfirmLaunchDialog } from '../features/apps/appsSlice';

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
            dispatch(hideConfirmLaunchDialog());
            launch(app);
        },
        onCancel: () => dispatch(hideConfirmLaunchDialog()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfirmLaunchDialog);
