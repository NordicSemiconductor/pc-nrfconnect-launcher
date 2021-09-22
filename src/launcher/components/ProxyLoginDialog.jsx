/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import { bool, func, string } from 'prop-types';

class ProxyLoginDialog extends React.Component {
    constructor() {
        super();
        this.state = {
            password: '',
        };
        this.onUserChanged = this.onUserChanged.bind(this);
        this.onPasswordChanged = this.onPasswordChanged.bind(this);
        this.onSubmitClicked = this.onSubmitClicked.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
    }

    onUserChanged(event) {
        const { onUsernameChanged } = this.props;
        onUsernameChanged(event.target.value);
    }

    onPasswordChanged(event) {
        this.setState({
            password: event.target.value,
        });
    }

    onSubmitClicked() {
        const { onSubmit, username } = this.props;
        const { password } = this.state;
        onSubmit(username, password);
        this.setState({
            password: '',
        });
    }

    onKeyPress(event) {
        if (event.key === 'Enter' && this.isValidInput()) {
            this.onSubmitClicked();
        }
    }

    isValidInput() {
        const { username } = this.props;
        const { password } = this.state;
        return username !== '' && password !== '';
    }

    render() {
        const { isVisible, message, onCancel, username } = this.props;
        const { password } = this.state;
        return (
            <Modal show={isVisible} backdrop>
                <Modal.Header closeButton={false}>
                    <Modal.Title>Proxy authentication required</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{message}</p>
                    <Form.Group controlId="username">
                        <Form.Label>Username:</Form.Label>
                        <InputGroup>
                            <Form.Control
                                autoFocus
                                value={username}
                                onChange={this.onUserChanged}
                                onKeyPress={this.onKeyPress}
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>Password:</Form.Label>
                        <InputGroup>
                            <Form.Control
                                value={password}
                                type="password"
                                onChange={this.onPasswordChanged}
                                onKeyPress={this.onKeyPress}
                            />
                        </InputGroup>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button
                        onClick={this.onSubmitClicked}
                        disabled={!this.isValidInput()}
                    >
                        Login
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

ProxyLoginDialog.propTypes = {
    isVisible: bool.isRequired,
    message: string.isRequired,
    username: string.isRequired,
    onUsernameChanged: func.isRequired,
    onCancel: func.isRequired,
    onSubmit: func.isRequired,
};

export default ProxyLoginDialog;
