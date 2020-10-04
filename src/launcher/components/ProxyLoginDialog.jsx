/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

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
    isVisible: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    onUsernameChanged: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default ProxyLoginDialog;
