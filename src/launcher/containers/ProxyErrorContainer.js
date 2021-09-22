/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import * as ProxyActions from '../actions/proxyActions';
import ProxyErrorDialog from '../components/ProxyErrorDialog';

function mapStateToProps(state) {
    const { proxy } = state;

    return {
        isVisible: proxy.isErrorDialogVisible,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onOk: () => dispatch(ProxyActions.loginErrorDialogClosedAction()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProxyErrorDialog);
