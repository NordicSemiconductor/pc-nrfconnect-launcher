/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { bool, func, string } from 'prop-types';

const InputLineDialog = ({
    isVisible,
    title,
    placeholder,
    subtext,
    onOk,
    onCancel,
}) => (
    <Modal show={isVisible} onHide={onCancel} backdrop="static">
        <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Form
            onSubmit={e => {
                onOk(e.currentTarget.inputField.value);
                e.preventDefault();
            }}
        >
            <Modal.Body>
                <Form.Control
                    as="input"
                    type="text"
                    name="inputField"
                    placeholder={placeholder}
                />
                <small className="text-muted">{subtext}</small>
            </Modal.Body>
            <Modal.Footer>
                <ButtonToolbar className="wide-btns">
                    <Button type="submit" variant="outline-primary">
                        Add
                    </Button>
                    <Button
                        variant="outline-secondary"
                        onClick={() => onCancel()}
                    >
                        Close
                    </Button>
                </ButtonToolbar>
            </Modal.Footer>
        </Form>
    </Modal>
);

InputLineDialog.propTypes = {
    isVisible: bool,
    title: string.isRequired,
    placeholder: string,
    subtext: string,
    onOk: func.isRequired,
    onCancel: func.isRequired,
};

InputLineDialog.defaultProps = {
    isVisible: false,
    placeholder: null,
    subtext: null,
};

export default InputLineDialog;
