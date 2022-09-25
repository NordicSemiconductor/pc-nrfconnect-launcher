/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import ProxyErrorDialog from '../components/ProxyErrorDialog';
import { loginErrorDialogClosed } from '../features/proxyLogin/proxyLoginSlice';

function mapStateToProps(state) {
    const { proxy } = state;

    return {
        isVisible: proxy.isErrorDialogVisible,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onOk: () => dispatch(loginErrorDialogClosed()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProxyErrorDialog);
