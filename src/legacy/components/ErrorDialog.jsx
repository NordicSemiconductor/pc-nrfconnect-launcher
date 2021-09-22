/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { List } from 'immutable';
import { bool, func, instanceOf } from 'prop-types';

const ErrorDialog = ({ isVisible, messages, onClose }) => (
    <Modal show={isVisible} onHide={onClose}>
        <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {messages.map(message => (
                <p className="core-error-dialog-message" key={message}>
                    {message}
                </p>
            ))}
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={onClose}>Close</Button>
        </Modal.Footer>
    </Modal>
);

ErrorDialog.propTypes = {
    isVisible: bool.isRequired,
    messages: instanceOf(List).isRequired,
    onClose: func.isRequired,
};

export default ErrorDialog;
