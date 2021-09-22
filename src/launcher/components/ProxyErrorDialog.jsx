/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { bool, func } from 'prop-types';

const ProxyErrorDialog = ({ isVisible, onOk }) => (
    <Modal show={isVisible} backdrop>
        <Modal.Header>
            <Modal.Title>Proxy error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>
                It appears that you are having problems authenticating with a
                proxy server. This will prevent you from using certain features
                of nRF Connect, such as installing apps from the
                &quot;Add/remove apps&quot; screen.
            </p>
            <p>
                If you are unable to resolve the issue, then go to Settings and
                disable &quot;Check for updates at startup&quot;. Then restart
                nRF Connect and install apps manually by following the
                instructions at
                https://github.com/NordicSemiconductor/pc-nrfconnect-launcher.
            </p>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={onOk}>OK</Button>
        </Modal.Footer>
    </Modal>
);

ProxyErrorDialog.propTypes = {
    isVisible: bool.isRequired,
    onOk: func.isRequired,
};

export default ProxyErrorDialog;
