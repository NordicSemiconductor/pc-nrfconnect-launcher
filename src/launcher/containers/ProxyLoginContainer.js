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
        requestId: proxy.requestId,
        message: proxy.loginDialogMessage,
        username: proxy.username,
        isVisible: proxy.isLoginDialogVisible,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onUsernameChanged: username =>
            dispatch(ProxyActions.changeUserName(username)),
        onCancel: requestId =>
            dispatch(ProxyActions.loginCancelledByUser(requestId)),
        onSubmit: (requestId, username, password) =>
            dispatch(
                ProxyActions.sendLoginRequest(requestId, username, password)
            ),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProxyLoginDialog);
