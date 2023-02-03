/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ReactMarkdown from 'react-markdown';

import {
    App,
    DownloadableApp,
    isDownloadable,
    isInstalled,
    isWithdrawn,
    updateAvailable,
} from '../../../ipc/apps';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { updateDownloadableApp } from '../apps/appsEffects';
import { getDownloadableApp } from '../apps/appsSlice';
import { getReleaseNotesDialog, hide } from './releaseNotesDialogSlice';

const canBeInstalledOrUpdated = (app?: App): app is DownloadableApp =>
    !isWithdrawn(app) &&
    isDownloadable(app) &&
    (!isInstalled(app) || updateAvailable(app));

export default () => {
    const dispatch = useLauncherDispatch();
    const appToDisplay = useLauncherSelector(getReleaseNotesDialog);
    const app = useLauncherSelector(getDownloadableApp(appToDisplay));

    if (isWithdrawn(app)) {
        return null;
    }

    const isVisible = appToDisplay.name != null;

    const hideDialog = () => dispatch(hide());

    return (
        <Modal
            show={isVisible}
            onHide={hideDialog}
            size="xl"
            scrollable
            key="releaseNotes"
        >
            <Modal.Header>
                <Modal.Title>
                    Release notes for {app?.displayName ?? appToDisplay.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="release-notes">
                <ReactMarkdown
                    source={app?.releaseNotes ?? ''}
                    linkTarget="_blank"
                />
            </Modal.Body>
            <Modal.Footer>
                {canBeInstalledOrUpdated(app) && (
                    <Button
                        variant="primary"
                        onClick={() => {
                            dispatch(updateDownloadableApp(app));
                            hideDialog();
                        }}
                    >
                        {isInstalled(app)
                            ? 'Update to latest version'
                            : 'Install'}
                    </Button>
                )}
                <Button variant="outline-primary" onClick={hideDialog}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
