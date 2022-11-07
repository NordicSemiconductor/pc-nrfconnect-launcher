/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ReactMarkdown from 'react-markdown';

import { InstalledDownloadableApp } from '../../../ipc/apps';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { upgradeDownloadableApp } from '../apps/appsEffects';
import { getDownloadableApp } from '../apps/appsSlice';
import { getReleaseNotesDialog, hide } from './releaseNotesDialogSlice';

type Uninstalled = { isInstalled: false };
const canBeInstalledOrUpdated = (
    app?: Uninstalled | InstalledDownloadableApp
) => !app?.isInstalled || app?.currentVersion !== app?.latestVersion;

export default () => {
    const dispatch = useLauncherDispatch();
    const appToDisplay = useLauncherSelector(getReleaseNotesDialog);
    const app = useLauncherSelector(getDownloadableApp(appToDisplay)) ?? {
        name: appToDisplay.name ?? '',
        source: appToDisplay.source ?? '',
        description: '',
        url: '',
        isInstalled: false,
        displayName: '',
        releaseNote: undefined,
        latestVersion: '',
    };

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
                <Modal.Title>Release notes for {app.displayName}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="release-notes">
                <ReactMarkdown
                    source={app.releaseNote ?? ''}
                    linkTarget="_blank"
                />
            </Modal.Body>
            <Modal.Footer>
                {canBeInstalledOrUpdated(app) && (
                    <Button
                        variant="primary"
                        onClick={() => {
                            dispatch(
                                upgradeDownloadableApp(app, app.latestVersion)
                            );
                            hideDialog();
                        }}
                    >
                        {app.isInstalled
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
