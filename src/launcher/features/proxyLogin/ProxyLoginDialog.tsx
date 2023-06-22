/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';

import { answerProxyLoginRequest } from '../../../ipc/proxyLogin';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import {
    changeUserName,
    getProxyLoginRequest,
    loginCancelledByUser,
    loginRequestSent,
} from './proxyLoginSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const [password, setPassword] = useState('');

    const { isVisible, username, host, requestId } =
        useLauncherSelector(getProxyLoginRequest);

    const cancel = useCallback(() => {
        answerProxyLoginRequest(requestId!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        dispatch(loginCancelledByUser());
    }, [dispatch, requestId]);

    const submit = useCallback(() => {
        answerProxyLoginRequest(requestId!, username, password); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        dispatch(loginRequestSent());
        setPassword('');
    }, [dispatch, password, requestId, username]);

    const inputIsValid = useMemo(
        () => username !== '' && password !== '',
        [password, username]
    );

    const submitOnEnter: React.KeyboardEventHandler = useCallback(
        event => {
            if (event.key === 'Enter' && inputIsValid) {
                submit();
            }
        },
        [inputIsValid, submit]
    );

    return (
        <Modal show={isVisible} backdrop>
            <Modal.Header closeButton={false}>
                <Modal.Title>Proxy authentication required</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    The proxy server {host} requires authentication. Please
                    enter username and password
                </p>
                <Form.Group controlId="username">
                    <Form.Label>Username:</Form.Label>
                    <InputGroup>
                        <Form.Control
                            autoFocus
                            value={username}
                            onChange={event =>
                                dispatch(changeUserName(event.target.value))
                            }
                            onKeyPress={submitOnEnter}
                        />
                    </InputGroup>
                </Form.Group>
                <Form.Group controlId="password">
                    <Form.Label>Password:</Form.Label>
                    <InputGroup>
                        <Form.Control
                            value={password}
                            type="password"
                            onChange={event => setPassword(event.target.value)}
                            onKeyPress={submitOnEnter}
                        />
                    </InputGroup>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={cancel}>Cancel</Button>
                <Button onClick={submit} disabled={!inputIsValid}>
                    Login
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
