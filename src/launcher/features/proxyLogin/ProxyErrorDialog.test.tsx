/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import render from '../../../test/testrenderer';
import ProxyErrorDialog from './ProxyErrorDialog';
import {
    loginCancelledByUser,
    loginErrorDialogClosed,
    loginRequestedByServer,
} from './proxyLoginSlice';

const requestId = 'test ID';
const authInfo = {
    isProxy: true,
    scheme: 'https',
    host: 'host',
    port: 4711,
    realm: 'realm',
};

describe('ProxyErrorDialog', () => {
    it('is initially invisible', () => {
        expect(
            render(<ProxyErrorDialog />, [
                loginRequestedByServer({ requestId, authInfo }),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is displayed after users canceled the login', () => {
        expect(
            render(<ProxyErrorDialog />, [
                loginRequestedByServer({ requestId, authInfo }),
                loginCancelledByUser(),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is hidden again after users confirmed the login', () => {
        expect(
            render(<ProxyErrorDialog />, [
                loginRequestedByServer({ requestId, authInfo }),
                loginCancelledByUser(),
                loginErrorDialogClosed(),
            ]).baseElement
        ).toMatchSnapshot();
    });
});
