/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import * as ProxyActions from '../actions/proxyActions';
import ProxyLoginDialog from '../components/ProxyLoginDialog';

function mapStateToProps(state) {
    const { proxy } = state;

    return {
        message: proxy.loginDialogMessage,
        username: proxy.username,
        isVisible: proxy.isLoginDialogVisible,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onUsernameChanged: username =>
            dispatch(ProxyActions.changeUserName(username)),
        onCancel: () => dispatch(ProxyActions.loginCancelledByUser()),
        onSubmit: (username, password) =>
            dispatch(ProxyActions.sendLoginRequest(username, password)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProxyLoginDialog);
