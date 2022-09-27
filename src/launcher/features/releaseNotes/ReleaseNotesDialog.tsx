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
import { upgradeDownloadableApp } from '../../actions/appsActions';
import { getDownloadableApp } from '../../reducers/appsReducer';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getReleaseNotesDialog, hide } from './releaseNotesDialogSlice';

type Uninstalled = { isInstalled: false };
const canBeInstalledOrUpdated = (
    app?: Uninstalled | InstalledDownloadableApp
) => !app?.isInstalled || app?.currentVersion !== app?.latestVersion;

export default () => {
    const dispatch = useLauncherDispatch();
    const { source, name } = useLauncherSelector(getReleaseNotesDialog);
    const app = useLauncherSelector(getDownloadableApp({ source, name })) ?? {
        isInstalled: false,
        displayName: '',
        releaseNote: '',
        latestVersion: '',
    };
    const { isInstalled, displayName, releaseNote, latestVersion } = app;

    const isVisible = name != null;

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
                <Modal.Title>Release notes for {displayName}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="release-notes">
                <ReactMarkdown source={releaseNote ?? ''} linkTarget="_blank" />
            </Modal.Body>
            <Modal.Footer>
                {canBeInstalledOrUpdated(app) && (
                    <Button
                        variant="primary"
                        onClick={() => {
                            dispatch(
                                upgradeDownloadableApp(
                                    name!, // eslint-disable-line @typescript-eslint/no-non-null-assertion -- If the name is undefined, then the whole dialog is invisble
                                    latestVersion,
                                    source! // eslint-disable-line @typescript-eslint/no-non-null-assertion
                                )
                            );
                            hideDialog();
                        }}
                    >
                        {isInstalled ? 'Update to latest version' : 'Install'}
                    </Button>
                )}
                <Button variant="outline-primary" onClick={hideDialog}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
