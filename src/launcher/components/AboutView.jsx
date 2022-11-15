/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { PDFObject } from 'react-pdfobject';

import WithScrollbarContainer from '../containers/WithScrollbarContainer';

const appVersion = require('@electron/remote').app.getVersion();

const AboutView = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <WithScrollbarContainer>
            <Card body>
                <Row>
                    <Col>
                        <Card.Title>Version</Card.Title>
                    </Col>
                </Row>
                <p>nRF Connect for Desktop v{appVersion}</p>
            </Card>
            <Card body>
                <Row>
                    <Col>
                        <Card.Title>Documentation</Card.Title>
                    </Col>
                </Row>
                <Button
                    href="https://www.nordicsemi.com/Products/Development-tools/nrf-connect-for-desktop"
                    target="_blank"
                    variant="outline-primary"
                >
                    Open documentation
                </Button>
            </Card>
            <Card body>
                <Row>
                    <Col>
                        <Card.Title>License</Card.Title>
                    </Col>
                </Row>
                <Button variant="outline-primary" onClick={handleShow}>
                    Show license
                </Button>

                <Modal
                    className="pdfobject-modal"
                    size="lg"
                    show={show}
                    onHide={handleClose}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>License</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/* This is just an example pdf, License file goes here */}
                        <PDFObject
                            className="pdfobject"
                            url="ApplicationDesignGuide.pdf"
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Card>
        </WithScrollbarContainer>
    );
};

export default AboutView;
