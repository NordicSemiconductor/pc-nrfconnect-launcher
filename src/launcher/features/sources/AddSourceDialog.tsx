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

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { addSource } from './sourcesEffects';
import { getIsAddSourceVisible, hideAddSource } from './sourcesSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isVisible = useLauncherSelector(getIsAddSourceVisible);

    const cancel = () => dispatch(hideAddSource());

    return (
        <Modal show={isVisible} onHide={cancel} backdrop="static">
            <Modal.Header>
                <Modal.Title>Add source</Modal.Title>
            </Modal.Header>
            <Form
                onSubmit={e => {
                    const url = e.currentTarget.inputField.value;
                    dispatch(addSource(url));
                    dispatch(hideAddSource());
                    e.preventDefault();
                }}
            >
                <Modal.Body>
                    <Form.Control
                        as="input"
                        type="text"
                        name="inputField"
                        placeholder="https://..."
                    />
                    <small className="text-muted">
                        The source file must be in .json format
                    </small>
                </Modal.Body>
                <Modal.Footer>
                    <ButtonToolbar className="wide-btns">
                        <Button type="submit" variant="outline-primary">
                            Add
                        </Button>
                        <Button variant="outline-secondary" onClick={cancel}>
                            Close
                        </Button>
                    </ButtonToolbar>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
