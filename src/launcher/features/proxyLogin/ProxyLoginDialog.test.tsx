/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import render from '../../../testrenderer';
import ProxyLoginDialog from './ProxyLoginDialog';
import {
    changeUserName,
    loginCancelledByUser,
    loginRequestedByServer,
    loginRequestSent,
} from './proxyLoginSlice';

const requestId = 'test ID';
const authInfo = {
    isProxy: true,
    scheme: 'https',
    host: 'test host',
    port: 4711,
    realm: 'test realm',
};

describe('ProxyLoginDialog', () => {
    it('is initially invisible', () => {
        expect(render(<ProxyLoginDialog />).baseElement).toMatchSnapshot();
    });

    it('is displayed after a login is requested', () => {
        expect(
            render(<ProxyLoginDialog />, [
                loginRequestedByServer({ requestId, authInfo }),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is updated if users enter a username', () => {
        expect(
            render(<ProxyLoginDialog />, [
                loginRequestedByServer({ requestId, authInfo }),
                changeUserName('new username'),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is invisible after users cancel the login', () => {
        expect(
            render(<ProxyLoginDialog />, [
                loginRequestedByServer({ requestId, authInfo }),
                loginCancelledByUser(),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is invisible after users enter username and password', () => {
        expect(
            render(<ProxyLoginDialog />, [
                loginRequestedByServer({ requestId, authInfo }),
                loginRequestSent('the username'),
            ]).baseElement
        ).toMatchSnapshot();
    });
});
