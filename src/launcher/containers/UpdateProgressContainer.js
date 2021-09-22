/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import * as AutoUpdateActions from '../actions/autoUpdateActions';
import UpdateProgressDialog from '../components/UpdateProgressDialog';

function mapStateToProps(state) {
    const { autoUpdate } = state;

    return {
        isVisible: autoUpdate.isUpdateProgressDialogVisible,
        isProgressSupported: autoUpdate.isProgressSupported,
        isCancelSupported: autoUpdate.isCancelSupported,
        version: autoUpdate.latestVersion,
        percentDownloaded: autoUpdate.percentDownloaded,
        isCancelling: autoUpdate.isCancelling,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onCancel: () => dispatch(AutoUpdateActions.cancelDownload()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UpdateProgressDialog);
