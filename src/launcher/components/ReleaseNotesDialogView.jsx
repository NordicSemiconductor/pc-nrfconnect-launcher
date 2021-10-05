/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ReactMarkdown from 'react-markdown';
import { bool, func, string } from 'prop-types';

const view = ({
    canUpdate,
    displayName,
    latestVersion,
    name,
    releaseNote,
    source,
    onUpgrade,
    onHideReleaseNotes,
    isInstalled,
}) => (
    <Modal
        show={!!name}
        onHide={onHideReleaseNotes}
        size="xl"
        scrollable
        key="releaseNotes"
    >
        <Modal.Header>
            <Modal.Title>Release notes for {displayName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="release-notes">
            <ReactMarkdown source={releaseNote} linkTarget="_blank" />
        </Modal.Body>
        <Modal.Footer>
            {canUpdate && (
                <Button
                    variant="primary"
                    onClick={() => {
                        onUpgrade(name, latestVersion, source);
                        onHideReleaseNotes();
                    }}
                >
                    {isInstalled ? 'Update to latest version' : 'Install'}
                </Button>
            )}
            <Button variant="outline-primary" onClick={onHideReleaseNotes}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>
);

view.propTypes = {
    canUpdate: bool,
    displayName: string,
    latestVersion: string,
    releaseNote: string,
    source: string,
    name: string,
    onUpgrade: func.isRequired,
    onHideReleaseNotes: func.isRequired,
    isInstalled: bool,
};

view.defaultProps = {
    canUpdate: false,
    displayName: '',
    latestVersion: '',
    releaseNote: '',
    source: '',
    name: '',
};

export default view;
