/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { remote } from 'electron';

import { connect } from '../../decoration';
import * as AppReloadDialogActions from '../actions/appReloadDialogActions';
import AppReloadDialog from '../components/AppReloadDialog';

function mapStateToProps(state) {
    const { appReloadDialog } = state.core;

    return {
        isVisible: appReloadDialog.isVisible,
        message: appReloadDialog.message,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onConfirmReload: () => dispatch(remote.getCurrentWindow().reload()),
        onCancelReload: () => {
            dispatch(AppReloadDialogActions.hideDialog());
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    AppReloadDialog,
    'AppReloadDialog'
);
