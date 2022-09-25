/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import { answerProxyLoginRequest } from '../../ipc/proxyLogin';
import ProxyLoginDialog from '../components/ProxyLoginDialog';
import {
    changeUserName,
    loginCancelledByUser,
    loginRequestSent,
} from '../features/proxyLogin/proxyLoginSlice';

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
        onUsernameChanged: username => dispatch(changeUserName(username)),
        onCancel: requestId => {
            answerProxyLoginRequest(requestId);
            dispatch(loginCancelledByUser());
        },
        onSubmit: (requestId, username, password) => {
            answerProxyLoginRequest(requestId, username, password);
            dispatch(loginRequestSent(username));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProxyLoginDialog);
